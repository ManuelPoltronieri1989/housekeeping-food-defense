from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta, timezone
import uuid
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

OWNER_EMAIL = "poltronieri.manuel@gmail.com"
JWT_SECRET = os.environ.get("JWT_SECRET", "hk-secret-change-me-please-987654")
JWT_ALG = "HS256"
JWT_EXPIRES_HOURS = 24 * 30  # 30 days

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ============== Auth Models & helpers ==============
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordIn(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=6)

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str

class AuthOut(BaseModel):
    token: str
    user: UserOut


def role_for(email: str) -> str:
    return "owner" if email.lower().strip() == OWNER_EMAIL.lower() else "operator"


def create_token(user_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=JWT_EXPIRES_HOURS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Token mancante")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token non valido o scaduto")
    user_id = payload.get("sub")
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="Utente non trovato")
    return user


# ============== Routes ==============
@api_router.get("/")
async def root():
    return {"message": "Housekeeping & Food Defense API"}


@api_router.post("/auth/register", response_model=AuthOut)
async def register(data: RegisterIn):
    email = data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email già registrata")
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": data.name.strip(),
        "password_hash": pwd_ctx.hash(data.password),
        "role": role_for(email),
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(user)
    token = create_token(user["id"], user["email"])
    return AuthOut(
        token=token,
        user=UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]),
    )


@api_router.post("/auth/login", response_model=AuthOut)
async def login(data: LoginIn):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not pwd_ctx.verify(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    # ensure role aligns to OWNER_EMAIL rule
    expected_role = role_for(user["email"])
    if user.get("role") != expected_role:
        await db.users.update_one({"id": user["id"]}, {"$set": {"role": expected_role}})
        user["role"] = expected_role
    token = create_token(user["id"], user["email"])
    return AuthOut(
        token=token,
        user=UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]),
    )


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user.get("role", "operator"))


@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordIn):
    """Simple password reset: utente fornisce email + nuova password e il sistema aggiorna direttamente.
    Nessuna verifica via email (scelta dell'utente per uso interno)."""
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Email non registrata")
    new_hash = pwd_ctx.hash(data.new_password)
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": new_hash}})
    return {"ok": True, "message": "Password aggiornata con successo"}


# ============== Audit Endpoints ==============
class AuditIn(BaseModel):
    id: str
    type: str  # "Safety" | "Quality"
    mode: str  # "safety" | "quality"
    area: str
    date: str  # DD/MM/YYYY
    inspector: str
    score: float
    criticita: list = []
    sectorScores: dict = {}
    sectorComments: dict = {}
    threshold: int
    maxScore: int
    wk: Optional[int] = None
    yr: Optional[int] = None


@api_router.post("/audits")
async def create_audit(data: AuditIn, user: dict = Depends(get_current_user)):
    doc = data.dict()
    doc["user_id"] = user["id"]
    doc["user_email"] = user["email"]
    doc["user_name"] = user.get("name", "")
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.audits.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/audits")
async def list_audits(user: dict = Depends(get_current_user)):
    is_owner = user.get("role") == "owner"
    query = {} if is_owner else {"user_id": user["id"]}
    cursor = db.audits.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=10000)
    for d in docs:
        d.pop("_id", None)
    return docs


@api_router.delete("/audits/{audit_id}")
async def delete_audit(audit_id: str, user: dict = Depends(get_current_user)):
    is_owner = user.get("role") == "owner"
    query = {"id": audit_id} if is_owner else {"id": audit_id, "user_id": user["id"]}
    res = await db.audits.delete_one(query)
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Audit non trovato")
    return {"ok": True}


class AuditPatchIn(BaseModel):
    date: Optional[str] = None
    inspector: Optional[str] = None
    score: Optional[float] = None


@api_router.patch("/audits/{audit_id}")
async def patch_audit(audit_id: str, data: AuditPatchIn, user: dict = Depends(get_current_user)):
    is_owner = user.get("role") == "owner"
    query = {"id": audit_id} if is_owner else {"id": audit_id, "user_id": user["id"]}
    update = {k: v for k, v in data.dict().items() if v is not None}
    if not update:
        return {"ok": True}
    res = await db.audits.update_one(query, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Audit non trovato")
    return {"ok": True}


# ============== Criticità State ==============
class CritResolveIn(BaseModel):
    resolvedDate: str
    resolvedBy: Optional[str] = ""


@api_router.get("/criticita-state")
async def get_criticita_state(user: dict = Depends(get_current_user)):
    """Restituisce lo stato (resolved/dismissed) di tutte le criticità.
    Owner vede tutto, operator solo i propri."""
    is_owner = user.get("role") == "owner"
    query = {} if is_owner else {"user_id": user["id"]}
    cursor = db.criticita_state.find(query)
    docs = await cursor.to_list(length=10000)
    for d in docs:
        d.pop("_id", None)
    return docs


@api_router.post("/criticita/{crit_id}/resolve")
async def resolve_criticita(crit_id: str, data: CritResolveIn, user: dict = Depends(get_current_user)):
    await db.criticita_state.update_one(
        {"crit_id": crit_id},
        {"$set": {
            "crit_id": crit_id,
            "resolved": True,
            "resolvedDate": data.resolvedDate,
            "resolvedBy": data.resolvedBy or "",
            "user_id": user["id"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"ok": True}


@api_router.post("/criticita/{crit_id}/unresolve")
async def unresolve_criticita(crit_id: str, user: dict = Depends(get_current_user)):
    await db.criticita_state.update_one(
        {"crit_id": crit_id},
        {"$set": {"resolved": False, "resolvedDate": None, "resolvedBy": None,
                  "user_id": user["id"],
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}


@api_router.post("/criticita/{crit_id}/dismiss")
async def dismiss_criticita(crit_id: str, user: dict = Depends(get_current_user)):
    await db.criticita_state.update_one(
        {"crit_id": crit_id},
        {"$set": {"crit_id": crit_id, "dismissed": True,
                  "user_id": user["id"],
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}


# ============== Config Questions ==============
class ConfigQuestionsIn(BaseModel):
    Safety: list = []
    Quality: list = []


@api_router.get("/config/questions")
async def get_config_questions(user: dict = Depends(get_current_user)):
    doc = await db.config.find_one({"_id": "questions"})
    if not doc:
        return {"Safety": None, "Quality": None}  # frontend userà i default
    return {"Safety": doc.get("Safety", []), "Quality": doc.get("Quality", [])}


@api_router.put("/config/questions")
async def put_config_questions(data: ConfigQuestionsIn, user: dict = Depends(get_current_user)):
    if user.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Solo l'Owner può modificare la configurazione")
    await db.config.update_one(
        {"_id": "questions"},
        {"$set": {"Safety": data.Safety, "Quality": data.Quality,
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
