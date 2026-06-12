"""Backend API tests for Housekeeping & Food Defense app.
Covers: auth (register/login/me/reset-password), audits CRUD, criticita state, config questions.
Ripristina alla fine le password originali per non rompere i test successivi.
"""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cleaning-connect-10.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

OWNER_EMAIL = "poltronieri.manuel@gmail.com"
OWNER_PWD = "Test1234"
OP_EMAIL = "operatore1@test.com"
OP_PWD = "Pass1234"


# ---------- helpers ----------
def _post(path, json=None, token=None):
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.post(f"{API}{path}", json=json, headers=h, timeout=15)

def _get(path, token=None):
    h = {}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.get(f"{API}{path}", headers=h, timeout=15)

def _put(path, json=None, token=None):
    h = {"Content-Type": "application/json"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.put(f"{API}{path}", json=json, headers=h, timeout=15)

def _delete(path, token=None):
    h = {}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return requests.delete(f"{API}{path}", headers=h, timeout=15)


def _ensure_user(email, password, name):
    """Ensure user exists; if login fails, register it. Returns token."""
    r = _post("/auth/login", {"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["token"], r.json()["user"]
    # Try register
    r = _post("/auth/register", {"email": email, "password": password, "name": name})
    if r.status_code == 200:
        return r.json()["token"], r.json()["user"]
    # If exists but pwd is wrong, reset
    rr = _post("/auth/reset-password", {"email": email, "new_password": password})
    if rr.status_code == 200:
        r = _post("/auth/login", {"email": email, "password": password})
        if r.status_code == 200:
            return r.json()["token"], r.json()["user"]
    pytest.skip(f"Cannot ensure user {email}: {r.status_code} {r.text}")


@pytest.fixture(scope="session")
def owner_auth():
    return _ensure_user(OWNER_EMAIL, OWNER_PWD, "Manuel Poltronieri")

@pytest.fixture(scope="session")
def op_auth():
    return _ensure_user(OP_EMAIL, OP_PWD, "Operatore Uno")


# ---------- root health ----------
def test_root():
    r = _get("/")
    assert r.status_code == 200
    assert "message" in r.json()


# ---------- auth ----------
class TestAuth:
    def test_login_owner(self, owner_auth):
        token, user = owner_auth
        assert isinstance(token, str) and len(token) > 10
        assert user["email"] == OWNER_EMAIL
        assert user["role"] == "owner"

    def test_login_operator(self, op_auth):
        token, user = op_auth
        assert user["email"] == OP_EMAIL
        assert user["role"] == "operator"

    def test_me_endpoint(self, owner_auth):
        token, _ = owner_auth
        r = _get("/auth/me", token=token)
        assert r.status_code == 200
        assert r.json()["email"] == OWNER_EMAIL
        assert r.json()["role"] == "owner"

    def test_me_no_token(self):
        r = _get("/auth/me")
        assert r.status_code == 401

    def test_login_invalid_pwd(self):
        r = _post("/auth/login", {"email": OWNER_EMAIL, "password": "wrong-xxx"})
        assert r.status_code == 401

    def test_register_duplicate(self):
        r = _post("/auth/register", {"email": OWNER_EMAIL, "password": "x123456", "name": "X"})
        assert r.status_code == 400


# ---------- reset password ----------
class TestResetPassword:
    def test_reset_unknown_email_404(self):
        r = _post("/auth/reset-password", {
            "email": f"unknown-{uuid.uuid4().hex[:6]}@example.com",
            "new_password": "abcdef"
        })
        assert r.status_code == 404
        assert "non registrata" in r.json().get("detail", "").lower()

    def test_reset_short_password_422(self):
        r = _post("/auth/reset-password", {"email": OWNER_EMAIL, "new_password": "abc"})
        assert r.status_code == 422  # pydantic min_length

    def test_reset_owner_password_and_restore(self):
        new_pwd = "TempPwd_" + uuid.uuid4().hex[:6]
        # Change
        r = _post("/auth/reset-password", {"email": OWNER_EMAIL, "new_password": new_pwd})
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # Login with new
        r2 = _post("/auth/login", {"email": OWNER_EMAIL, "password": new_pwd})
        assert r2.status_code == 200
        # Old should fail
        r3 = _post("/auth/login", {"email": OWNER_EMAIL, "password": OWNER_PWD})
        assert r3.status_code == 401
        # Restore original
        r4 = _post("/auth/reset-password", {"email": OWNER_EMAIL, "new_password": OWNER_PWD})
        assert r4.status_code == 200
        r5 = _post("/auth/login", {"email": OWNER_EMAIL, "password": OWNER_PWD})
        assert r5.status_code == 200


# ---------- audits ----------
class TestAudits:
    def _new_audit(self):
        return {
            "id": f"TEST_{uuid.uuid4()}",
            "type": "Safety",
            "mode": "safety",
            "area": "Magazzino A",
            "date": "15/01/2026",
            "inspector": "Tester",
            "score": 88.5,
            "criticita": [{"id": "c1", "domanda": "Q1", "settore": "S1", "note": "N"}],
            "sectorScores": {"S1": 88.5},
            "sectorComments": {"S1": "ok"},
            "threshold": 80,
            "maxScore": 100,
            "wk": 3,
            "yr": 2026,
        }

    def test_operator_create_audit_persists(self, op_auth):
        token, _ = op_auth
        payload = self._new_audit()
        r = _post("/audits", payload, token=token)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["id"] == payload["id"]
        assert body["user_email"] == OP_EMAIL
        assert "_id" not in body
        # Verify persistence: list audits as operator (only own)
        rr = _get("/audits", token=token)
        assert rr.status_code == 200
        ids = [a["id"] for a in rr.json()]
        assert payload["id"] in ids

    def test_owner_sees_all_audits(self, owner_auth, op_auth):
        op_token, _ = op_auth
        own_token, _ = owner_auth
        payload = self._new_audit()
        r = _post("/audits", payload, token=op_token)
        assert r.status_code == 200
        # Owner sees it
        rr = _get("/audits", token=own_token)
        assert rr.status_code == 200
        ids = [a["id"] for a in rr.json()]
        assert payload["id"] in ids

    def test_operator_cannot_see_other_audits(self, owner_auth, op_auth):
        own_token, _ = owner_auth
        op_token, _ = op_auth
        # Owner creates an audit
        payload = self._new_audit()
        payload["id"] = f"TEST_OWN_{uuid.uuid4()}"
        r = _post("/audits", payload, token=own_token)
        assert r.status_code == 200
        # Operator should NOT see it
        rr = _get("/audits", token=op_token)
        assert rr.status_code == 200
        ids = [a["id"] for a in rr.json()]
        assert payload["id"] not in ids

    def test_patch_audit_and_verify(self, op_auth):
        token, _ = op_auth
        payload = self._new_audit()
        r = _post("/audits", payload, token=token)
        assert r.status_code == 200
        aid = payload["id"]
        r = requests.patch(f"{API}/audits/{aid}",
                            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                            json={"inspector": "Updated Insp"}, timeout=15)
        assert r.status_code == 200
        rr = _get("/audits", token=token)
        match = [a for a in rr.json() if a["id"] == aid]
        assert match and match[0]["inspector"] == "Updated Insp"

    def test_delete_audit_removes_it(self, op_auth):
        token, _ = op_auth
        payload = self._new_audit()
        _post("/audits", payload, token=token)
        aid = payload["id"]
        r = _delete(f"/audits/{aid}", token=token)
        assert r.status_code == 200
        rr = _get("/audits", token=token)
        ids = [a["id"] for a in rr.json()]
        assert aid not in ids

    def test_audits_no_token_401(self):
        r = _get("/audits")
        assert r.status_code == 401


# ---------- criticita state ----------
class TestCriticita:
    def test_resolve_and_get(self, owner_auth):
        token, _ = owner_auth
        cid = f"TEST_C_{uuid.uuid4().hex[:8]}"
        r = _post(f"/criticita/{cid}/resolve", {"resolvedDate": "15/01/2026", "resolvedBy": "Owner"}, token=token)
        assert r.status_code == 200
        rr = _get("/criticita-state", token=token)
        assert rr.status_code == 200
        found = [d for d in rr.json() if d.get("crit_id") == cid]
        assert found and found[0]["resolved"] is True
        # unresolve
        r2 = _post(f"/criticita/{cid}/unresolve", {}, token=token)
        assert r2.status_code == 200
        rr2 = _get("/criticita-state", token=token)
        found2 = [d for d in rr2.json() if d.get("crit_id") == cid]
        assert found2 and found2[0]["resolved"] is False


# ---------- config questions ----------
class TestConfigQuestions:
    def test_operator_cannot_update_config(self, op_auth):
        token, _ = op_auth
        r = _put("/config/questions", {"Safety": [], "Quality": []}, token=token)
        assert r.status_code == 403
        assert "Owner" in r.json().get("detail", "")

    def test_owner_can_update_config(self, owner_auth):
        token, _ = owner_auth
        payload = {"Safety": [{"sector": "S1", "questions": ["Q1"]}], "Quality": []}
        r = _put("/config/questions", payload, token=token)
        assert r.status_code == 200
        rr = _get("/config/questions", token=token)
        assert rr.status_code == 200
        assert rr.json()["Safety"] == payload["Safety"]
