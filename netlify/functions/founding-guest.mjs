const MAILERLITE_SUBSCRIBERS_URL = "https://connect.mailerlite.com/api/subscribers";
const DEFAULT_FOUNDING_GUESTS_GROUP_ID = "196343617034389388";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  };
}

function normaliseName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normaliseEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Adds a Founding Guest to MailerLite from a Netlify server-side environment.
 * MAILERLITE_API_KEY must be configured in Netlify, never in browser code.
 */
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { Allow: "POST, OPTIONS" }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  let input;
  try {
    input = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, message: "Invalid request." });
  }

  // Silently accept honeypot submissions without sending them to MailerLite.
  if (String(input.company || "").trim()) {
    return json(200, { ok: true });
  }

  const name = normaliseName(input.name);
  const email = normaliseEmail(input.email);

  if (!name || name.length > 120 || !isValidEmail(email) || email.length > 254) {
    return json(400, { ok: false, message: "Please provide a valid name and email address." });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_FOUNDING_GUESTS_GROUP_ID || DEFAULT_FOUNDING_GUESTS_GROUP_ID;

  if (!apiKey) {
    console.error("[Founding Guest] MailerLite API key is not configured.");
    return json(503, { ok: false, message: "Sign-up is temporarily unavailable." });
  }

  try {
    const response = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        fields: { name },
        groups: [groupId],
        status: "active",
      }),
    });

    if (!response.ok) {
      console.error(`[Founding Guest] MailerLite returned status ${response.status}.`);
      const statusCode = response.status === 429 ? 429 : 502;
      return json(statusCode, { ok: false, message: "We could not complete your sign-up." });
    }

    return json(200, { ok: true });
  } catch (error) {
    console.error("[Founding Guest] MailerLite request failed.", error);
    return json(502, { ok: false, message: "We could not complete your sign-up." });
  }
}
