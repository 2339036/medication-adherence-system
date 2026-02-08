// backend/chatbot-service/utils/matchers.js
// Helper functions for matching user messages

// Normalise text to make matching easier
const normalise = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ""); // remove punctuation

// Basic keyword check: does message contain any keyword?
const includesAny = (message, keywords) => {
  const m = normalise(message);
  return keywords.some((k) => m.includes(normalise(k)));
};

// Simple "best match" for FAQs: count how many query phrases match
const bestFaqMatch = (message, faqs) => {
  const m = normalise(message);

  let best = null;
  let bestScore = 0;

  for (const item of faqs) {
    let score = 0;
    for (const phrase of item.q) {
      if (m.includes(normalise(phrase))) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore > 0 ? best : null;
};

module.exports = {
  normalise,
  includesAny,
  bestFaqMatch
};