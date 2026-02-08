// backend/chatbot-service/utils/agentIntents.js
// Extracts user intent like "set reminder at 20:00" from natural language.

function normalize(text) {
  return (text || "").toLowerCase().trim();
}

// Matches: "8", "8pm", "8 pm", "20:00", "8:30am", etc.
// Returns { hhmm: "HH:MM" } or null
function extractTime(text) {
  const t = normalize(text);

  // 24h: 20:00 / 08:30
  const match24 = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (match24) {
    const hh = match24[1].padStart(2, "0");
    const mm = match24[2];
    return { hhmm: `${hh}:${mm}` };
  }

  // 12h: 8pm / 8 pm / 8:30am / 8:30 am
  const match12 = t.match(/\b(1[0-2]|\d)(?::([0-5]\d))?\s?(am|pm)\b/);
  if (match12) {
    let hh = parseInt(match12[1], 10);
    const mm = match12[2] ? match12[2] : "00";
    const mer = match12[3];

    if (mer === "pm" && hh !== 12) hh += 12;
    if (mer === "am" && hh === 12) hh = 0;

    return { hhmm: `${String(hh).padStart(2, "0")}:${mm}` };
  }

  return null;
}

// Very simple extraction: tries to grab medication name after "for" or "to take"
function extractMedicationName(text) {
  const t = (text || "").trim();

  // e.g. "remind me to take metformin at 8pm"
  const takeMatch = t.match(/take\s+([a-zA-Z0-9\s-]+?)(?:\s+at\b|\s+every\b|$)/i);
  if (takeMatch && takeMatch[1]) return takeMatch[1].trim();

  // e.g. "set a reminder for paracetamol at 20:00"
  const forMatch = t.match(/for\s+([a-zA-Z0-9\s-]+?)(?:\s+at\b|\s+every\b|$)/i);
  if (forMatch && forMatch[1]) return forMatch[1].trim();

  return null;
}

// Detects quick “log intent”
function isLogTakenOrMissed(text) {
  const t = normalize(text);

  const taken = ["i took it", "taken", "i have taken", "i took my meds", "i took my medication"];
  const missed = ["i missed it", "missed", "i forgot", "i didn't take", "i did not take"];

  const hasTaken = taken.some((p) => t.includes(p));
  const hasMissed = missed.some((p) => t.includes(p));

  if (hasTaken) return { type: "TAKEN" };
  if (hasMissed) return { type: "MISSED" };

  return null;
}

// Detects reminder intent and returns { time, medicationName } if possible
function parseSetReminderIntent(text) {
  const t = normalize(text);

  const reminderKeywords = ["remind me", "set a reminder", "add a reminder", "reminder"];
  const hasReminderIntent = reminderKeywords.some((k) => t.includes(k));
  if (!hasReminderIntent) return null;

  const time = extractTime(text);
  if (!time) return { error: "NO_TIME" };

  const medicationName = extractMedicationName(text);
  return {
    time: time.hhmm,
    medicationName: medicationName || null
  };
}

module.exports = {
  parseSetReminderIntent,
  isLogTakenOrMissed
};