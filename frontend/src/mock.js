// Mock data for Housekeeping & Food Defense clone

export const AREA_COLORS = {
  'Area Arancione': { bg: '#fed7aa', text: '#9a3412', accent: '#f97316', light: '#fff7ed', soft: '#ffedd5' },
  'Area Blu':       { bg: '#bfdbfe', text: '#1e3a8a', accent: '#3b82f6', light: '#eff6ff', soft: '#dbeafe' },
  'Area Celeste':   { bg: '#a5f3fc', text: '#155e75', accent: '#06b6d4', light: '#ecfeff', soft: '#cffafe' },
  'Area Gialla':    { bg: '#fef08a', text: '#854d0e', accent: '#eab308', light: '#fefce8', soft: '#fef9c3' },
  'Area Grigia':    { bg: '#e5e7eb', text: '#374151', accent: '#6b7280', light: '#f9fafb', soft: '#f3f4f6' },
  'Area Rossa':     { bg: '#fecaca', text: '#991b1b', accent: '#ef4444', light: '#fef2f2', soft: '#fee2e2' },
  'Area Verde':     { bg: '#bbf7d0', text: '#14532d', accent: '#22c55e', light: '#f0fdf4', soft: '#dcfce7' },
  'Area Viola':     { bg: '#e9d5ff', text: '#581c87', accent: '#a855f7', light: '#faf5ff', soft: '#f3e8ff' },
};

export const AREAS_BY_BUILDING = {
  '110': ['Area Gialla', 'Area Celeste', 'Area Viola', 'Area Verde'],
  '111': ['Area Blu', 'Area Rossa', 'Area Arancio', 'Area Grigia'],
};

// Note: "Area Arancio" in calendar, but "Area Arancione" in scores. Keep both, but normalize.
export const AREAS_REPARTI = {
  'Area Gialla':    ['Settore B', 'Tettoia ricarica carrelli LOG', 'Settore C', 'Settore A'],
  'Area Celeste':   ['Carico posteriore', 'Carico Laterale', 'Piazzale cauzioni', 'Tettoia vetro', 'Schiacciamento'],
  'Area Rossa':     ['Settore 1', 'Settore 2', 'Settore 3'],
  'Area Viola':     ['Zone Reso/Consegna Mp', 'Magazzino Lattine', 'Fine Linea', 'Magazzino preforme A-PET', 'Magazzino Film/Destrosio', 'Scaffalatura Area 2200', 'Piazzale scarico lattine'],
  'Area Blu':       ['Settore 6', 'Settore 5', 'Tettoia ricarica carrelli - 111', 'Settore 4'],
  'Area Verde':     ['Magazzino Concentrati', 'Fine Linea fusti', 'Magazzino Preforme', 'Fine linea bib'],
  'Area Grigia':    ['Piazzale Parolini', 'Area ecologica', '110 Tettoia ricarica carrelli MAN', 'Perimetro esterno', 'Perimetro esterno lato ferrovia', '110 Tettoia Aws'],
  'Area Arancione': ['Settore 7', 'Settore 8'],
};

export const REPARTI_SCORES = {
  'Area Gialla': { score: 2.96, reparti: { 'Settore B': 2.86, 'Tettoia ricarica carrelli LOG': 3.00, 'Settore C': 3.00, 'Settore A': 3.00 } },
  'Area Celeste': { score: 3.00, reparti: { 'Carico posteriore': 3.00, 'Carico Laterale': 3.00, 'Piazzale cauzioni': 3.00, 'Tettoia vetro': 3.00, 'Schiacciamento': 3.00 } },
  'Area Rossa': { score: 2.90, reparti: { 'Settore 1': 3.00, 'Settore 2': 2.71, 'Settore 3': 3.00 } },
  'Area Viola': { score: 2.95, reparti: { 'Zone Reso/Consegna Mp': 3.00, 'Magazzino Lattine': 3.00, 'Fine Linea': 2.67, 'Magazzino preforme A-PET': 3.00, 'Magazzino Film/Destrosio': 3.00, 'Scaffalatura Area 2200': 3.00, 'Piazzale scarico lattine': 3.00 } },
  'Area Blu': { score: 3.00, reparti: { 'Settore 6': 3.00, 'Settore 5': 3.00, 'Tettoia ricarica carrelli - 111': 3.00, 'Settore 4': 3.00 } },
  'Area Verde': { score: 3.00, reparti: { 'Magazzino Concentrati': 3.00, 'Fine Linea fusti': 3.00, 'Magazzino Preforme': 3.00, 'Fine linea bib': 3.00 } },
  'Area Grigia': { score: 2.94, reparti: { 'Piazzale Parolini': 3.00, 'Area ecologica': 3.00, '110 Tettoia ricarica carrelli MAN': 2.67, 'Perimetro esterno': 3.00, 'Perimetro esterno lato ferrovia': 3.00, '110 Tettoia Aws': 3.00 } },
  'Area Arancione': { score: 2.90, reparti: { 'Settore 7': 2.80, 'Settore 8': 3.00 } },
};

export const AREA_ORDER = ['Area Gialla', 'Area Celeste', 'Area Rossa', 'Area Viola', 'Area Blu', 'Area Verde', 'Area Grigia', 'Area Arancione'];

export const MEDIA_PER_AREA_ORDER = ['Area Arancione', 'Area Blu', 'Area Celeste', 'Area Gialla', 'Area Grigia', 'Area Rossa', 'Area Verde', 'Area Viola'];

// Weekly trend data for chart (weeks 14-22)
export const WEEKLY_TREND = [
  { week: 'S14/2026', 'Area Gialla': 2.85, 'Area Celeste': 3.00, 'Area Rossa': 2.70, 'Area Viola': 2.90, 'Area Blu': 2.95, 'Area Verde': 3.00, 'Area Grigia': 2.80, 'Area Arancione': 2.75 },
  { week: 'S15/2026', 'Area Gialla': 2.90, 'Area Celeste': 3.00, 'Area Rossa': 2.50, 'Area Viola': 2.80, 'Area Blu': 2.90, 'Area Verde': 3.00, 'Area Grigia': 2.70, 'Area Arancione': 2.50 },
  { week: 'S16/2026', 'Area Gialla': 2.95, 'Area Celeste': 3.00, 'Area Rossa': 2.85, 'Area Viola': 2.95, 'Area Blu': 2.95, 'Area Verde': 3.00, 'Area Grigia': 2.85, 'Area Arancione': 2.85 },
  { week: 'S17/2026', 'Area Gialla': 2.92, 'Area Celeste': 3.00, 'Area Rossa': 2.80, 'Area Viola': 2.90, 'Area Blu': 3.00, 'Area Verde': 3.00, 'Area Grigia': 2.90, 'Area Arancione': 2.80 },
  { week: 'S18/2026', 'Area Gialla': 2.95, 'Area Celeste': 3.00, 'Area Rossa': 2.75, 'Area Viola': 2.92, 'Area Blu': 2.95, 'Area Verde': 3.00, 'Area Grigia': 2.80, 'Area Arancione': 2.85 },
  { week: 'S19/2026', 'Area Gialla': 2.98, 'Area Celeste': 3.00, 'Area Rossa': 2.95, 'Area Viola': 2.95, 'Area Blu': 3.00, 'Area Verde': 3.00, 'Area Grigia': 2.92, 'Area Arancione': 2.90 },
  { week: 'S20/2026', 'Area Gialla': 2.95, 'Area Celeste': 3.00, 'Area Rossa': 2.95, 'Area Viola': 2.92, 'Area Blu': 2.90, 'Area Verde': 3.00, 'Area Grigia': 2.95, 'Area Arancione': 2.88 },
  { week: 'S21/2026', 'Area Gialla': 2.96, 'Area Celeste': 3.00, 'Area Rossa': 2.92, 'Area Viola': 2.95, 'Area Blu': 3.00, 'Area Verde': 3.00, 'Area Grigia': 2.94, 'Area Arancione': 2.92 },
  { week: 'S22/2026', 'Area Gialla': 2.96, 'Area Celeste': 3.00, 'Area Rossa': 2.90, 'Area Viola': 2.95, 'Area Blu': 3.00, 'Area Verde': 3.00, 'Area Grigia': 2.94, 'Area Arancione': 2.90 },
];

export const DASHBOARD_STATS = {
  safety: {
    punteggioMedio: 2.96,
    auditTotali: 72,
    trend: 2.96,
    criticita: 0,
    settimana: 'Sett. 22 / 2026',
    criticitaList: [],
  },
  quality: {
    punteggioMedio: 4.6,
    auditTotali: 68,
    trend: 4.6,
    criticita: 1,
    settimana: 'Sett. 22 / 2026',
    criticitaList: [
      { area: 'Area Viola', reparto: 'Fine Linea', commento: 'Imballaggi danneggiati su pallet n.4, verificare lotto in entrata e isolare prodotto non conforme.', score: 2, inspector: 'Monica Abate' },
    ],
  }
};

export const INSPECTORS = [
  { area: 'Giallo', color: '#eab308', name: 'Francesco F.' },
  { area: 'Verde', color: '#22c55e', name: 'Monica' },
  { area: 'Viola', color: '#a855f7', name: 'Marilisa' },
  { area: 'Rosso', color: '#ef4444', name: 'Marco M.' },
  { area: 'Blu', color: '#3b82f6', name: 'Franco' },
  { area: 'Arancio', color: '#f97316', name: 'Mario' },
  { area: 'Celeste', color: '#06b6d4', name: 'Ilaria' },
  { area: 'Grigio', color: '#6b7280', name: 'Claudia' },
];

export const CALENDAR_AREAS = {
  '110': [
    { name: 'Area Gialla', color: '#eab308', reparti: ['Settore C', 'Tettoia ricarica carrelli LOG', 'Settore A', 'Settore B'] },
    { name: 'Area Celeste', color: '#06b6d4', reparti: ['Tettoia vetro', 'Piazzale cauzioni', 'Carico laterale', 'Carico posteriore', 'Schiacciamento'] },
    { name: 'Area Viola', color: '#a855f7', reparti: ['Fine linea', 'Magazzino Film/Destrosio', 'Scaffalatura Area 2200', 'Magazzino Lattine', 'Zone reso/consegna MP', 'Magazzino preforme A-PET', 'Piazzale scarico lattine'] },
    { name: 'Area Verde', color: '#22c55e', reparti: ['Magazzino Preforme', 'Magazzino Concentrati', 'Fine linea fusti', 'Fine linea BIB'] },
  ],
  '111': [
    { name: 'Area Blu', color: '#3b82f6', reparti: ['Settore 4', 'Settore 5', 'Settore 6', 'Tettoia ricarica carrelli'] },
    { name: 'Area Rossa', color: '#ef4444', reparti: ['Settore 1', 'Settore 2', 'Settore 3'] },
    { name: 'Area Arancio', color: '#f97316', reparti: ['Settore 7', 'Settore 8'] },
    { name: 'Area Grigia', color: '#6b7280', reparti: ['Parcheggio Parolini', '110 - Tettoia AWS', '110 - Tettoia ricarica carrelli MAN', '110 - Perimetro esterno lato ferrovia', 'Area ecologica', 'Parcheggi ST', 'Perimetro esterno'] },
  ],
};

// Safety audit questions (per sector)
export const SAFETY_QUESTIONS = [
  { id: 'S001', text: "Rispetto da parte dei carrellisti delle buone norme d'uso carrello (divieto di uso cellulare / cordless, velocità non elevata in prossimità di angoli ciechi, sufficiente distanza da altri carrelli in moto, rimozione chiave dal quadro con carrello incustodito, coperchio della batteria chiuso, ecc.)" },
  { id: 'S002', text: "Verifica stabilità stoccaggio prodotto finito" },
  { id: 'S003', text: "Autista del mezzo in posizione sicura (non all'interno dell'abitacolo) e che abbia consegnato le chiavi del mezzo" },
  { id: 'S004', text: "Vie di circolazione pedoni, vie di esodo ed uscite di emergenza, presidi di emergenza (estintori, idranti, docce di emergenza, kit di emergenza, ecc.) non ostruire con materiali, attrezzature, mezzi, prodotto" },
  { id: 'S005', text: "Il KIT antiversamento si trova in corrispondenza dell'apposita segnaletica? È in condizione idonee e presenta il sigillo di integrità?" },
  { id: 'S006', text: "Gestione elementi infrangibili: vetrate/finestre integre, assenza di rotture e corretto smaltimento di eventuali frammenti." },
];

export const QUALITY_QUESTIONS = [
  { id: 'Q001', text: 'Pulizia generale del reparto e dei macchinari (pavimenti, pareti, attrezzature)' },
  { id: 'Q002', text: 'Corretto stoccaggio dei materiali secondo procedure FIFO/FEFO' },
  { id: 'Q003', text: 'Identificazione e tracciabilità dei lotti di produzione' },
  { id: 'Q004', text: 'Conformità delle procedure di sanitizzazione' },
  { id: 'Q005', text: 'Verifica integrità degli imballaggi e dei sigilli' },
];

export const MONTHS = [
  'Gennaio 2026', 'Febbraio 2026', 'Marzo 2026', 'Aprile 2026', 'Maggio 2026', 'Giugno 2026',
  'Luglio 2025', 'Agosto 2025', 'Settembre 2025', 'Ottobre 2025', 'Novembre 2025', 'Dicembre 2025'
];

export const WEEKS = Array.from({ length: 22 }, (_, i) => `Settimana ${i + 1} / 2026`);

// Storico Audit data
const INSPECTOR_POOL = ['Marco Ridolfo', 'Mario La Rocca', 'Marilisa Magetti', 'Monica Abate', 'Marco Monti', 'Francesco Ferrero', 'Franco Bianchi', 'Claudia Verdi', 'Ilaria Bruno'];
const AUDIT_AREAS_FOR_HISTORY = ['Area Gialla', 'Area Celeste', 'Area Rossa', 'Area Viola', 'Area Blu', 'Area Verde', 'Area Grigia', 'Area Arancione'];

function buildAuditHistory() {
  const groups = [];
  let id = 1;
  for (let w = 22; w >= 14; w--) {
    const audits = [];
    const count = w === 22 ? 16 : 8 + ((w * 3) % 7);
    for (let i = 0; i < count; i++) {
      const area = AUDIT_AREAS_FOR_HISTORY[i % AUDIT_AREAS_FOR_HISTORY.length];
      const type = i % 2 === 0 ? 'Safety' : 'Quality';
      const dayOffset = i % 5;
      const date = new Date(2026, 4, 29 - (22 - w) * 7 - dayOffset);
      const score = type === 'Safety'
        ? +(2.6 + Math.random() * 0.4).toFixed(2)
        : +(4.3 + Math.random() * 0.7).toFixed(2);
      audits.push({
        id: id++,
        type,
        area,
        date: date.toLocaleDateString('it-IT'),
        inspector: INSPECTOR_POOL[(i + w) % INSPECTOR_POOL.length],
        score,
      });
    }
    const avg = +(audits.reduce((s, a) => s + a.score, 0) / audits.length).toFixed(2);
    groups.push({ week: w, year: 2026, count: audits.length, avg, audits });
  }
  return groups;
}

export const AUDIT_HISTORY = buildAuditHistory();
export const AUDIT_HISTORY_TOTAL = AUDIT_HISTORY.reduce((s, g) => s + g.count, 0);

// Configurazione - domande dettagliate per Area + Reparto
const baseSafetyTexts = [
  'Dispositivi di sicurezza dei carrelli funzionanti (cicalino, lampeggiante, retro-luce LED SPOT)',
  "Vie di circolazione pedoni, vie di esodo ed uscite di emergenza, presidi di emergenza (estintori, idranti, docce di emergenza, kit di emergenza, ecc.) non ostruire con materiali, attrezzature, mezzi, prodotto",
  "Verifica stabilità stoccaggio prodotto finito",
  "Autista del mezzo in posizione sicura e che abbia consegnato le chiavi del mezzo",
  "Il KIT antiversamento si trova in corrispondenza dell'apposita segnaletica? È in condizione idonee?",
  "Gestione elementi infrangibili: vetrate/finestre integre, assenza di rotture",
];

const baseQualityTexts = [
  'Pulizia generale del reparto e dei macchinari',
  'Corretto stoccaggio dei materiali secondo procedure FIFO/FEFO',
  'Identificazione e tracciabilità dei lotti di produzione',
  'Conformità delle procedure di sanitizzazione',
  'Verifica integrità degli imballaggi e dei sigilli',
];

function buildConfigQuestions(type) {
  const list = [];
  let id = 1;
  const prefix = type === 'Safety' ? 'S' : 'Q';
  const texts = type === 'Safety' ? baseSafetyTexts : baseQualityTexts;
  const areas = Object.keys(AREAS_REPARTI);
  for (const a of areas) {
    for (const r of AREAS_REPARTI[a]) {
      texts.forEach((t, idx) => {
        list.push({
          id: id++,
          code: `${prefix}${String(idx + 1).padStart(3, '0')}`,
          text: t,
          area: a,
          reparto: r,
          enabled: true,
        });
      });
    }
  }
  return list;
}

export const SAFETY_CONFIG_QUESTIONS = buildConfigQuestions('Safety');
export const QUALITY_CONFIG_QUESTIONS = buildConfigQuestions('Quality');

// Storico Criticità mock
export const CRITICITA_HISTORY = [
  { id: 1, area: 'Area Rossa', reparto: 'Settore 2', date: '29/05/2026', inspector: 'Marilisa Magetti', question: 'Verifica stabilità stoccaggio prodotto finito', score: 1, severity: 'Alta', type: 'Safety' },
  { id: 2, area: 'Area Gialla', reparto: 'Settore B', date: '22/05/2026', inspector: 'Marco Ridolfo', question: "Vie di circolazione pedoni non ostruite", score: 1, severity: 'Media', type: 'Safety' },
  { id: 3, area: 'Area Viola', reparto: 'Fine Linea', date: '20/05/2026', inspector: 'Monica Abate', question: 'Pulizia generale del reparto', score: 2, severity: 'Media', type: 'Quality' },
  { id: 4, area: 'Area Grigia', reparto: '110 Tettoia ricarica carrelli MAN', date: '15/05/2026', inspector: 'Claudia Verdi', question: 'Dispositivi di sicurezza dei carrelli funzionanti', score: 0, severity: 'Alta', type: 'Safety' },
  { id: 5, area: 'Area Arancione', reparto: 'Settore 7', date: '12/05/2026', inspector: 'Mario La Rocca', question: 'Gestione elementi infrangibili', score: 1, severity: 'Media', type: 'Safety' },
  { id: 6, area: 'Area Blu', reparto: 'Settore 4', date: '08/05/2026', inspector: 'Franco Bianchi', question: 'Corretto stoccaggio dei materiali FIFO/FEFO', score: 2, severity: 'Bassa', type: 'Quality' },
];
