/* ============================================================
   MOON & MONEY — Mini Money Chart email send
   ------------------------------------------------------------
   Receives the visitor's mini-chart data from the /mini-chart
   form (first_name, birth_date, birth_time, email, sun_sign,
   sun_line, moon_sign, moon_line) and sends a Luna-voice email
   via Resend.

   No Substack popup, no jarring tab-switch. The visitor sees the
   reveal on-page AND it lands in their inbox so they can come
   back to it. Crescent Club becomes a soft secondary CTA at the
   bottom of the email, not the gate.

   Env var required:
     RESEND_API_KEY  set in Netlify Dashboard → site settings →
                     Environment variables. Same key as the
                     chart-engine Render env.

   Endpoint: /.netlify/functions/mini-chart-email
   ============================================================ */

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "Luna Wilde <luna@moonandmoney.ca>";

const GLYPHS = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildText({ first_name, sun_sign, sun_line, moon_sign, moon_line }) {
  const greeting = first_name ? `${first_name},` : "Hello,";
  const lines = [
    greeting,
    "",
    "Your Mini Money Chart, as promised.",
    "",
    `${sun_sign} Sun`,
    sun_line,
  ];
  if (moon_sign && moon_line) {
    lines.push("", `${moon_sign} Moon`, moon_line);
  } else {
    lines.push(
      "",
      "Your Moon needs your birth time to lock in. The full Money Chart includes the exact placement at your birth city."
    );
  }
  lines.push(
    "",
    "Your full chart goes deeper. Three currents, the knot, what your chart holds.",
    "https://moonandmoney.ca/money-chart",
    "",
    "The Crescent Club is the slower companion. Moon-timed notes on the rhythm of the sky and the moves that meet it, once a week when it serves.",
    "https://moonandmoney.substack.com/subscribe",
    "",
    "Yours,",
    "Luna Wilde",
    "",
    "where the moon meets your money",
    "moonandmoney.ca"
  );
  return lines.join("\n");
}

function buildHtml({ first_name, sun_sign, sun_line, moon_sign, moon_line }) {
  const greeting = first_name ? escapeHtml(first_name) + "," : "Hello,";
  const sunGlyph = GLYPHS[sun_sign] || "";
  const moonGlyph = moon_sign ? (GLYPHS[moon_sign] || "") : "";
  const sunBlock = `
    <tr>
      <td align="center" style="padding:30px 36px 10px 36px;">
        <p style="margin:0;font-family:'Georgia',serif;font-size:38px;color:#C9A24E;line-height:1;">${sunGlyph}</p>
        <p style="margin:10px 0 0 0;font-family:'Georgia',serif;font-style:italic;font-size:22px;color:#0B2545;">${escapeHtml(sun_sign)} Sun</p>
        <p style="margin:14px 0 0 0;font-family:'Georgia',serif;font-size:16px;color:#0B2545;line-height:1.65;max-width:460px;">
          ${escapeHtml(sun_line)}
        </p>
      </td>
    </tr>`;
  const moonBlock = (moon_sign && moon_line) ? `
    <tr>
      <td align="center" style="padding:32px 36px 10px 36px;">
        <p style="margin:0;font-family:'Georgia',serif;font-size:38px;color:#C9A24E;line-height:1;">${moonGlyph}</p>
        <p style="margin:10px 0 0 0;font-family:'Georgia',serif;font-style:italic;font-size:22px;color:#0B2545;">${escapeHtml(moon_sign)} Moon</p>
        <p style="margin:14px 0 0 0;font-family:'Georgia',serif;font-size:16px;color:#0B2545;line-height:1.65;max-width:460px;">
          ${escapeHtml(moon_line)}
        </p>
      </td>
    </tr>` : `
    <tr>
      <td align="center" style="padding:28px 36px 10px 36px;">
        <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:15px;color:#5D6D7E;line-height:1.6;max-width:440px;">
          Your Moon needs your birth time to lock in. The full Money Chart includes the exact placement at your birth city.
        </p>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Your Mini Money Chart</title>
</head>
<body style="margin:0;padding:0;background-color:#0B2545;font-family:'Georgia','Times New Roman',serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#0B2545">
    <tr><td align="center" style="padding:0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#FCF7F1" style="width:100%;max-width:600px;background-color:#FCF7F1;">

        <tr>
          <td align="center" bgcolor="#0B2545" style="background-color:#0B2545;padding:24px 0;">
            <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:13px;color:#C9A24E;letter-spacing:.16em;">MOON &amp; MONEY</p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:32px 36px 0 36px;">
            <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:26px;color:#C9A24E;">${greeting}</p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:18px 36px 0 36px;">
            <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:#0B2545;line-height:1.55;">
              Your Mini Money Chart, as promised.
            </p>
          </td>
        </tr>

        ${sunBlock}
        ${moonBlock}

        <tr>
          <td align="center" style="padding:34px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="border-bottom:1px solid #C9A24E;width:60px;height:1px;font-size:0;line-height:0;">&nbsp;</td>
                <td style="width:18px;text-align:center;font-size:0;line-height:0;padding:0 4px;">
                  <span style="display:inline-block;width:6px;height:6px;background-color:#C9A24E;border-radius:50%;">&nbsp;</span>
                </td>
                <td style="border-bottom:1px solid #C9A24E;width:60px;height:1px;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:0 36px 6px 36px;">
            <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:18px;color:#0B2545;line-height:1.5;max-width:460px;">
              Your full chart goes deeper. Three currents, the knot, what your chart holds.
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:22px 0 8px 0;">
            <a href="https://moonandmoney.ca/money-chart.html" style="display:inline-block;background-color:#C9A24E;color:#0B2545;text-decoration:none;font-family:'Georgia',serif;font-style:italic;font-size:14px;padding:13px 28px;border-radius:2px;">Read the Money Chart</a>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:8px 36px 0 36px;">
            <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:14px;color:#5D6D7E;line-height:1.55;">
              Or join the <a href="https://moonandmoney.substack.com/subscribe" style="color:#C9A24E;text-decoration:none;border-bottom:1px solid #C9A24E;">Crescent Club</a> &mdash; moon-timed notes on the rhythm of the sky.
            </p>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:32px 0 28px 0;">
            <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:16px;color:#0B2545;">Yours,</p>
            <p style="margin:6px 0 0 0;font-family:'Georgia',serif;font-style:italic;font-size:18px;color:#C9A24E;">Luna Wilde</p>
          </td>
        </tr>

        <tr>
          <td align="center" bgcolor="#0B2545" style="background-color:#0B2545;padding:24px 0;">
            <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-style:italic;font-size:13px;color:#C9A24E;">where the moon meets your money</p>
            <p style="margin:0;font-family:'Georgia',serif;font-style:italic;font-size:12px;">
              <a href="https://moonandmoney.ca" style="color:#C9A24E;text-decoration:none;">moonandmoney.ca</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let data;
  try {
    data = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "bad_json" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const { first_name, email, sun_sign, sun_line, moon_sign, moon_line } = data || {};

  if (!email || !sun_sign || !sun_line) {
    return new Response(JSON.stringify({ error: "missing_required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const key = Netlify.env.get("RESEND_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const subject = first_name
    ? `${first_name}, your Mini Money Chart`
    : "Your Mini Money Chart";

  const text = buildText(data);
  const html = buildHtml(data);

  let r;
  try {
    r = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject,
        text,
        html,
      }),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "resend_unreachable", detail: String(e) }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }

  if (!r.ok) {
    const body = await r.text();
    return new Response(JSON.stringify({ error: "resend_rejected", status: r.status, body }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }

  const resp = await r.json();
  return new Response(JSON.stringify({ ok: true, id: resp.id }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
};
