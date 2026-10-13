const MAX_IMAGE_BYTES = 2_500_000;
const WEBHOOK_RE = /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+(?:\?.*)?$/i;

function reply(res, status, body) {
  return res.status(status).json(body);
}

module.exports = async function sendDiscord(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "รองรับเฉพาะการส่งข้อมูลแบบ POST" });
  }

  // The browser calls this endpoint on the same Vercel domain as the page.
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host && origin !== `https://${host}` && origin !== `http://${host}`) {
    return reply(res, 403, { error: "คำขอไม่ถูกต้อง กรุณาเปิดเว็บจากลิงก์หลัก" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const house = Number(body.house);
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const users = Array.isArray(body.users) ? body.users : [];
  const image = typeof body.image === "string" ? body.image : "";

  if (!Number.isInteger(house) || house < 1 || house > 6) {
    return reply(res, 400, { error: "ไม่พบบ้านที่เลือก" });
  }
  if (!content || content.length > 1800) {
    return reply(res, 400, { error: "ข้อความยาวเกินไปหรือไม่มีข้อความ" });
  }
  if (users.length > 5 || users.some((id) => !/^\d{17,20}$/.test(String(id)))) {
    return reply(res, 400, { error: "Discord ID ไม่ถูกต้อง กรุณาให้แอดมินตรวจสอบ" });
  }

  const match = image.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return reply(res, 400, { error: "รูปไม่ถูกต้อง กรุณาเลือกรูป PNG, JPG, WEBP หรือ GIF" });
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    return reply(res, 413, { error: "รูปใหญ่เกินไป กรุณาย่อรูปให้ไม่เกิน 2.5 MB แล้วลองอีกครั้ง" });
  }

  const webhook = process.env[`DISCORD_WEBHOOK_${house}`];
  if (!webhook) return reply(res, 503, { error: "แอดมินยังไม่ได้ตั้ง Webhook ของบ้านนี้ใน Vercel" });
  if (!WEBHOOK_RE.test(webhook)) return reply(res, 500, { error: "Webhook ที่แอดมินตั้งค่าไว้ไม่ถูกต้อง" });

  try {
    const mime = match[1].toLowerCase();
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[mime];
    const payload = {
      content,
      username: "ᴅɪᴀᴍᴏɴᴅʜᴇᴀᴅ",
      allowed_mentions: { parse: [], users: users.map(String) },
    };
    const form = new FormData();
    form.append("payload_json", JSON.stringify(payload));
    form.append("files[0]", new Blob([bytes], { type: mime }), `house-${house}.${extension}`);

    const discord = await fetch(webhook, { method: "POST", body: form });
    if (!discord.ok) return reply(res, 502, { error: "Discord ปฏิเสธการส่ง กรุณาให้แอดมินตรวจสอบ Webhook" });
    return reply(res, 200, { ok: true });
  } catch (_) {
    return reply(res, 502, { error: "เชื่อมต่อ Discord ไม่สำเร็จ ลองใหม่อีกครั้ง" });
  }
};
