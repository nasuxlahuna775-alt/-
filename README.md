# ᴅɪᴀᴍᴏɴᴅʜᴇᴀᴅ

เว็บแอปสำหรับเลือกบ้าน → เลือกคนที่จะแท็ก → แนบรูป → ส่งเข้า Discord

หน้าเว็บอยู่ใน `index.html` และมี API สำหรับส่ง Discord ที่ `api/send-discord.js`

---

## วิธีเอาขึ้น Vercel (สำหรับมือใหม่ ทำตามทีละข้อ)

### 1) สร้าง Repository
1. เข้า https://github.com → ล็อกอิน
2. กดปุ่มเขียว **New** (มุมขวาบน) → **New repository**
3. ตั้งชื่อเช่น `diamondhead` → เลือก **Public** → กด **Create repository**

### 2) อัปโหลดไฟล์
1. ในหน้า repo กด **Add file** → **Upload files**
2. อัปโหลด `index.html`, `firebase-config.js`, `database.rules.json`, `README.md` และไฟล์ `api/send-discord.js` โดยต้องวางไฟล์ API ไว้ในโฟลเดอร์ชื่อ `api`
3. กด **Commit changes**

### 3) เชื่อม Vercel และ Deploy
1. เชื่อม Repository นี้กับ Vercel แล้ว Deploy โปรเจกต์
2. ตรวจว่า Vercel เห็นไฟล์ `api/send-discord.js` อยู่ในโฟลเดอร์ `api`
3. แชร์ลิงก์ Vercel ให้สมาชิก

> ระบบส่ง Discord ต้องใช้ Vercel เพราะ GitHub Pages ไม่รองรับ API ฝั่งเซิร์ฟเวอร์

---

## โหมดแอดมิน (คนทั่วไปแก้ไม่ได้)
- กดปุ่ม **🔒 แอดมิน** มุมขวาบน → ใส่รหัส **090889**
- เฉพาะแอดมินเท่านั้นที่แก้ชื่อบ้าน / Discord ID ได้
- คนทั่วไปเห็นแค่ชื่อสมาชิก เลือกแท็ก แนบรูป และส่งได้เท่านั้น
- ตั้ง Webhook ใน Vercel → Project Settings → Environment Variables โดยใช้ชื่อตัวแปร `DISCORD_WEBHOOK_1` สำหรับบ้าน 1, `DISCORD_WEBHOOK_2` สำหรับบ้าน 2 ไล่ไปถึง `DISCORD_WEBHOOK_6` แล้ว Redeploy
- ถ้าต้องการใช้ Webhook เดียวกันทุกบ้าน ให้ตั้ง `DISCORD_WEBHOOK_URL` แทน (ตัวแปรรายบ้านจะมีลำดับสำคัญกว่า)
- อย่าวาง Webhook ในโค้ด, GitHub หรือ Firebase เพราะผู้เข้าชมอาจนำลิงก์ไปใช้ได้

### เปลี่ยนรหัสแอดมิน
เปิดไฟล์ `index.html` → ค้นหาบรรทัด `const ADMIN_PIN='090889';` → แก้เลขในเครื่องหมายคำพูด

## ตั้งค่า Firebase และซิงก์ข้อมูลร่วม
1. ใน Firebase Console ของโปรเจกต์ `tarsaray1` เปิด **Authentication → Sign-in method → Email/Password** แล้วสร้างบัญชีแอดมินหนึ่งบัญชี
2. ใน Firebase Console → Authentication → Users คัดลอก UID ของบัญชีแอดมิน แล้วใช้ UID เดียวกันใน `firebase-config.js` และ `database.rules.json` (ตั้งค่าไว้แล้วในไฟล์ชุดนี้)
3. ไปที่ **Realtime Database → Rules** แล้วเผยแพร่กฎจาก `database.rules.json` หากฐานข้อมูลมีแอปอื่นใช้อยู่ ให้รวมกฎกับของเดิมก่อน
4. ใน **Authentication → Settings → Authorized domains** เพิ่ม `dmh-pied.vercel.app`
5. อัปโหลดไฟล์ทั้งหมด แล้ว deploy เวอร์ชันใหม่บน Vercel

เมื่อแอดมินกด 🔒 ใส่ PIN และเข้าสู่ระบบ Firebase แล้ว การแก้ชื่อบ้าน/สมาชิกจะซิงก์ให้ผู้เข้าชมทุกคนแบบเรียลไทม์ ผู้เข้าชมทั่วไปอ่านข้อมูลร่วมได้ แต่เขียนไม่ได้ ปุ่มสำรอง/กู้คืนยังใช้สำหรับสำรองส่วนตัวตามบัญชี Firebase

ข้อมูลที่อ่านร่วมได้ประกอบด้วยโลโก้ ชื่อบ้าน ชื่อสมาชิก และ Discord ID; Webhook เก็บเป็น Environment Variable ฝั่ง Vercel และรูปแนบส่งผ่าน API ชั่วคราว ไม่ถูกบันทึกใน Firebase

## หมายเหตุ
- localStorage ใช้เก็บสำเนาในเครื่อง; ข้อมูลหลักอ่านจาก Firebase เพื่อให้ผู้ใช้เห็นข้อมูลชุดเดียวกัน
- Webhook และรูปแนบชั่วคราวไม่อยู่ในข้อมูลสำรอง
- การสำรองแต่ละครั้งจะสร้างชุดข้อมูลใหม่ในบัญชี Firebase ที่เข้าสู่ระบบ ต้องใช้บัญชีเดิมเมื่อต้องการกู้คืน
- ถ้าโปรเจกต์ Firebase นี้มีแอปอื่นใช้ Realtime Database อยู่ ให้รวมกฎใน `database.rules.json` เข้ากับกฎเดิมก่อนกด Publish
