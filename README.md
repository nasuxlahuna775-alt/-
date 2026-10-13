# ᴅɪᴀᴍᴏɴᴅʜᴇᴀᴅ

เว็บแอปสำหรับเลือกบ้าน → เลือกคนที่จะแท็ก → แนบรูป → ส่งเข้า Discord

หน้าเว็บอยู่ใน `index.html`; API ใน `api/sendDiscord.js` เป็นตัวกลางส่งข้อมูลเข้า Discord โดยเก็บ Webhook เป็น Environment Variables ลับใน Vercel

---

## วิธีเอาขึ้น Vercel (สำหรับมือใหม่ ทำตามทีละข้อ)

### 1) สร้าง Repository
1. เข้า https://github.com → ล็อกอิน
2. กดปุ่มเขียว **New** (มุมขวาบน) → **New repository**
3. ตั้งชื่อเช่น `diamondhead` → เลือก **Public** → กด **Create repository**

### 2) อัปโหลดไฟล์
1. ในหน้า repo กด **Add file** → **Upload files**
2. อัปโหลด `index.html`, `api/sendDiscord.js`, `firebase-config.js`, `database.rules.json`, `firebase.json`, `.firebaserc`, `README.md` และไฟล์รูปที่เว็บใช้
3. กด **Commit changes**

### 3) เชื่อม Vercel และ Deploy
1. เชื่อม Repository นี้กับ Vercel แล้ว Deploy โปรเจกต์
2. แชร์ลิงก์ Vercel ให้สมาชิก

## ตั้งค่า Discord บน Vercel

ไม่ต้อง Deploy Firebase Functions หรือใช้ Firebase CLI อีกต่อไป API ส่ง Discord จะ Deploy พร้อมเว็บบน Vercel อัตโนมัติ

1. เปิด Vercel → โปรเจกต์เว็บ → **Settings → Environment Variables**
2. เพิ่มตัวแปร `DISCORD_WEBHOOK_1` แล้ววาง URL Webhook ของบ้าน 1 เป็นค่า
3. ทำซ้ำตามต้องการสำหรับบ้าน 2–6 โดยใช้ชื่อ `DISCORD_WEBHOOK_2` ถึง `DISCORD_WEBHOOK_6`
4. เลือก Environment เป็น **Production** แล้วกด **Save**
5. เปิด **Deployments** แล้วกด **Redeploy** เวอร์ชัน Production ล่าสุด

Webhook จะไม่แสดงในหน้าเว็บหรือ Firebase หากต้องเปลี่ยนห้อง Discord ให้แก้ค่าตัวแปรใน Vercel แล้ว Redeploy อีกครั้ง

---

## โหมดแอดมิน (คนทั่วไปแก้ไม่ได้)
- กดปุ่ม **🔒 แอดมิน** มุมขวาบน → ใส่รหัส **090889**
- เฉพาะแอดมินเท่านั้นที่แก้ชื่อบ้าน / Discord ID ได้
- คนทั่วไปเห็นแค่ชื่อสมาชิก เลือกแท็ก แนบรูป และส่งได้เท่านั้น
- Webhook ตั้งค่าใน Vercel Environment Variables ตามหัวข้อด้านบน ไม่ต้องใส่ในหน้าเว็บ
- ห้ามใส่ Webhook ใน GitHub, ไฟล์หน้าเว็บ, Firebase Rules หรือแชต

### เปลี่ยนรหัสแอดมิน
เปิดไฟล์ `index.html` → ค้นหาบรรทัด `const ADMIN_PIN='090889';` → แก้เลขในเครื่องหมายคำพูด

## ตั้งค่า Firebase และซิงก์ข้อมูลร่วม
1. ใน Firebase Console ของโปรเจกต์ `tarsaray1` เปิด **Authentication → Sign-in method → Email/Password** แล้วสร้างบัญชีแอดมินหนึ่งบัญชี
2. ใน Firebase Console → Authentication → Users คัดลอก UID ของบัญชีแอดมิน แล้วใช้ UID เดียวกันใน `firebase-config.js` และ `database.rules.json` (ตั้งค่าไว้แล้วในไฟล์ชุดนี้)
3. ไปที่ **Realtime Database → Rules** แล้วเผยแพร่กฎจาก `database.rules.json` หากฐานข้อมูลมีแอปอื่นใช้อยู่ ให้รวมกฎกับของเดิมก่อน
4. ใน **Authentication → Settings → Authorized domains** เพิ่ม `dmh-pied.vercel.app`
5. อัปโหลดไฟล์ทั้งหมด แล้ว deploy เวอร์ชันใหม่บน Vercel

เมื่อแอดมินกด 🔒 ใส่ PIN และเข้าสู่ระบบ Firebase แล้ว การแก้ชื่อบ้าน/สมาชิกจะซิงก์ให้ผู้เข้าชมทุกคนแบบเรียลไทม์ ผู้เข้าชมทั่วไปอ่านข้อมูลร่วมได้ แต่เขียนไม่ได้ ปุ่มสำรอง/กู้คืนยังใช้สำหรับสำรองส่วนตัวตามบัญชี Firebase

ข้อมูลสาธารณะร่วมกันประกอบด้วยโลโก้ ชื่อบ้าน ชื่อสมาชิก และ Discord ID; Webhook อยู่ใน Vercel Environment Variables ส่วนรูปแนบส่งผ่าน Vercel API ชั่วคราวและไม่บันทึกใน Firebase

## หมายเหตุ
- localStorage ใช้เก็บสำเนาในเครื่อง; ข้อมูลหลักอ่านจาก Firebase เพื่อให้ผู้ใช้เห็นข้อมูลชุดเดียวกัน
- Webhook และรูปแนบชั่วคราวไม่อยู่ในข้อมูลสำรอง
- การสำรองแต่ละครั้งจะสร้างชุดข้อมูลใหม่ในบัญชี Firebase ที่เข้าสู่ระบบ ต้องใช้บัญชีเดิมเมื่อต้องการกู้คืน
- ถ้าโปรเจกต์ Firebase นี้มีแอปอื่นใช้ Realtime Database อยู่ ให้รวมกฎใน `database.rules.json` เข้ากับกฎเดิมก่อนกด Publish
