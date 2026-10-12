const MAX_IMAGE_BYTES = 2_500_000;
const WEBHOOK_RE = /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+(?:\?.*)?$/i;

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } },
};

function reply(res, status, body) {
  res.status(status).json(body);
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === String(host).split(",")[0].trim().toLowerCase();
  } catch (_) {
    return false;
  }
}

function getBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "รองรับเฉพาะการส่งข้อมูลแบบ POST" });
  }
  if (!sameOrigin(req)) return reply(res, 403, { error: "คำขอไม่ถูกต้อง กรุณาเปิดเว็บจากลิงก์หลัก" });

  let input;
  try {
    input = getBody(req);
  } catch (_) {
    return reply(res, 400, { error: "ข้อมูลที่ส่งมาอ่านไม่ได้" });
  }

  const house = Number(input.house);
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const users = Array.isArray(input.users) ? input.users : [];
  const image = typeof input.image === "string" ? input.image : "";
  if (!Number.isInteger(house) || house < 1 || house > 6) return reply(res, 400, { error: "ไม่พบบ้านที่เลือก" });
  if (!content || content.length > 1800) return reply(res, 400, { error: "ข้อความยาวเกินไปหรือไม่มีข้อความ" });
  if (users.length > 5 || users.some((id) => !/^\d{17,20}$/.test(String(id)))) {
    return reply(res, 400, { error: "Discord ID ไม่ถูกต้อง กรุณาให้แอดมินตรวจสอบ" });
  }

  const match = image.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return reply(res, 400, { error: "รูปไม่ถูกต้อง กรุณาเลือกรูป PNG, JPG, WEBP หรือ GIF" });
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    return reply(res, 413, { error: "รูปใหญ่เกินไป กรุณาย่อรูปให้ไม่เกิน 2.5 MB แล้วลองอีกครั้ง" });
  }

  const webhook = process.env[`DISCORD_WEBHOOK_${house}`] || process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return reply(res, 503, { error: "ยังไม่ได้ตั้งค่า Webhook ของบ้านนี้" });
  if (!WEBHOOK_RE.test(webhook)) return reply(res, 500, { error: "Webhook ที่แอดมินตั้งค่าไว้ไม่ถูกต้อง" });

  const mime = match[1].toLowerCase();
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[mime];
  const discordPayload = {
    content,
    username: "ᴅɪᴀᴍᴏɴᴅʜᴇᴀᴅ",
    allowed_mentions: { parse: [], users: users.map(String) },
  };
  const form = new FormData();
  form.append("payload_json", JSON.stringify(discordPayload));
  form.append("files[0]", new Blob([bytes], { type: mime }), `house-${house}.${extension}`);

  try {
    const discord = await fetch(webhook, { method: "POST", body: form });
    if (!discord.ok) {
      // Do not return Discord response details because they can contain the secret webhook URL.
      return reply(res, 502, { error: "Discord ปฏิเสธการส่ง กรุณาให้แอดมินตรวจสอบ Webhook" });
    }
    return reply(res, 200, { ok: true });
  } catch (_) {
    return reply(res, 502, { error: "เชื่อมต่อ Discord ไม่สำเร็จ ลองใหม่อีกครั้ง" });
  }
}
