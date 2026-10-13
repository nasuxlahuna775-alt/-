const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

initializeApp({ databaseURL: "https://tarsaray1-default-rtdb.firebaseio.com" });

const SITE_ORIGIN = "https://dmh-pied.vercel.app";
const MAX_IMAGE_BYTES = 2_500_000;
const WEBHOOK_RE = /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+(?:\?.*)?$/i;

exports.sendDiscord = onRequest(
  { region: "asia-southeast1", cors: [SITE_ORIGIN], timeoutSeconds: 60, memory: "512MiB" },
  async (req, res) => {
    if (req.get("origin") !== SITE_ORIGIN) {
      return res.status(403).json({ error: "คำขอไม่ถูกต้อง กรุณาเปิดเว็บจากลิงก์หลัก" });
    }
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      return res.status(405).json({ error: "รองรับเฉพาะการส่งข้อมูลแบบ POST" });
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const house = Number(body.house);
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const users = Array.isArray(body.users) ? body.users : [];
    const image = typeof body.image === "string" ? body.image : "";
    if (!Number.isInteger(house) || house < 1 || house > 6) {
      return res.status(400).json({ error: "ไม่พบบ้านที่เลือก" });
    }
    if (!content || content.length > 1800) {
      return res.status(400).json({ error: "ข้อความยาวเกินไปหรือไม่มีข้อความ" });
    }
    if (users.length > 5 || users.some((id) => !/^\d{17,20}$/.test(String(id)))) {
      return res.status(400).json({ error: "Discord ID ไม่ถูกต้อง กรุณาให้แอดมินตรวจสอบ" });
    }

    const match = image.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) return res.status(400).json({ error: "รูปไม่ถูกต้อง กรุณาเลือกรูป PNG, JPG, WEBP หรือ GIF" });
    const bytes = Buffer.from(match[2], "base64");
    if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: "รูปใหญ่เกินไป กรุณาย่อรูปให้ไม่เกิน 2.5 MB แล้วลองอีกครั้ง" });
    }

    try {
      const snapshot = await getDatabase().ref(`privateConfig/webhooks/${house}`).get();
      const webhook = snapshot.val();
      if (!webhook) return res.status(503).json({ error: "ยังไม่ได้ตั้งค่า Webhook ของบ้านนี้" });
      if (typeof webhook !== "string" || !WEBHOOK_RE.test(webhook)) {
        return res.status(500).json({ error: "Webhook ที่แอดมินตั้งค่าไว้ไม่ถูกต้อง" });
      }

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

      const discord = await fetch(webhook, { method: "POST", body: form });
      if (!discord.ok) {
        // Never return Discord response details; they may contain the secret webhook URL.
        return res.status(502).json({ error: "Discord ปฏิเสธการส่ง กรุณาให้แอดมินตรวจสอบ Webhook" });
      }
      return res.status(200).json({ ok: true });
    } catch (_) {
      return res.status(502).json({ error: "เชื่อมต่อ Discord ไม่สำเร็จ ลองใหม่อีกครั้ง" });
    }
  },
);
