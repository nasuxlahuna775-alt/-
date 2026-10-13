# ᴅɪᴀᴍᴏɴᴅʜᴇᴀᴅ

เว็บแอปสำหรับเลือกบ้าน → เลือกคนที่จะแท็ก → แนบรูป → ส่งเข้า Discord

หน้าเว็บอยู่ใน `index.html`; Firebase Cloud Function เป็นตัวกลางส่งข้อมูลเข้า Discord โดยเก็บ Webhook ไว้ใน Realtime Database ที่แอดมินเท่านั้นอ่านได้

---

## วิธีเอาขึ้น Vercel (สำหรับมือใหม่ ทำตามทีละข้อ)

### 1) สร้าง Repository
1. เข้า https://github.com → ล็อกอิน
2. กดปุ่มเขียว **New** (มุมขวาบน) → **New repository**
3. ตั้งชื่อเช่น `diamondhead` → เลือก **Public** → กด **Create repository**

### 2) อัปโหลดไฟล์
1. ในหน้า repo กด **Add file** → **Upload files**
2. อัปโหลด `index.html`, `firebase-config.js`, `database.rules.json`, `firebase.json`, `.firebaserc`, `README.md` และโฟลเดอร์ `functions` ที่มี `index.js` กับ `package.json`
3. กด **Commit changes**

### 3) เชื่อม Vercel และ Deploy
1. เชื่อม Repository นี้กับ Vercel แล้ว Deploy โปรเจกต์
2. แชร์ลิงก์ Vercel ให้สมาชิก

## Deploy Firebase Function สำหรับส่ง Discord

การ Deploy Cloud Functions ต้องใช้แพ็กเกจ Firebase Blaze และบัญชีเรียกเก็บเงิน ซึ่งมีค่าใช้จ่ายตามการใช้งาน ควรตรวจราคาและตั้ง Budget alerts ก่อนเปิดใช้งาน ([เงื่อนไข Firebase](https://firebase.google.com/docs/functions/get-started))

1. ติดตั้ง Node.js 20 และ Firebase CLI (`npm install -g firebase-tools`)
2. เปิด PowerShell ในโฟลเดอร์โปรเจกต์ แล้วรัน `firebase login`
3. รัน `firebase deploy --only functions,database`
4. หลัง Deploy สำเร็จ เปิดเว็บจากโดเมน Vercel แล้วเข้าสู่ระบบแอดมิน

---

## โหมดแอดมิน (คนทั่วไปแก้ไม่ได้)
- กดปุ่ม **🔒 แอดมิน** มุมขวาบน → ใส่รหัส **090889**
- เฉพาะแอดมินเท่านั้นที่แก้ชื่อบ้าน / Discord ID ได้
- คนทั่วไปเห็นแค่ชื่อสมาชิก เลือกแท็ก แนบรูป และส่งได้เท่านั้น
- เลือกบ้าน แล้วกรอก Webhook ในช่อง **ตั้งค่า Webhook ของบ้านนี้** จากนั้นกด **บันทึก** ทำซ้ำตามบ้านที่ต้องการ
- ต้องเข้าสู่ระบบด้วยบัญชี Firebase Admin ที่ UID ตรงกับ `firebaseAdminUid` ก่อนตั้งค่า
- ห้ามเปิดสิทธิ์อ่าน `privateConfig` ให้สาธารณะ และอย่าวาง Webhook ใน GitHub หรือแชต

### เปลี่ยนรหัสแอดมิน
เปิดไฟล์ `index.html` → ค้นหาบรรทัด `const ADMIN_PIN='090889';` → แก้เลขในเครื่องหมายคำพูด

## ตั้งค่า Firebase และซิงก์ข้อมูลร่วม
1. ใน Firebase Console ของโปรเจกต์ `tarsaray1` เปิด **Authentication → Sign-in method → Email/Password** แล้วสร้างบัญชีแอดมินหนึ่งบัญชี
2. ใน Firebase Console → Authentication → Users คัดลอก UID ของบัญชีแอดมิน แล้วใช้ UID เดียวกันใน `firebase-config.js` และ `database.rules.json` (ตั้งค่าไว้แล้วในไฟล์ชุดนี้)
3. ไปที่ **Realtime Database → Rules** แล้วเผยแพร่กฎจาก `database.rules.json` หากฐานข้อมูลมีแอปอื่นใช้อยู่ ให้รวมกฎกับของเดิมก่อน
4. ใน **Authentication → Settings → Authorized domains** เพิ่ม `dmh-pied.vercel.app`
5. อัปโหลดไฟล์ทั้งหมด แล้ว deploy เวอร์ชันใหม่บน Vercel

เมื่อแอดมินกด 🔒 ใส่ PIN และเข้าสู่ระบบ Firebase แล้ว การแก้ชื่อบ้าน/สมาชิกจะซิงก์ให้ผู้เข้าชมทุกคนแบบเรียลไทม์ ผู้เข้าชมทั่วไปอ่านข้อมูลร่วมได้ แต่เขียนไม่ได้ ปุ่มสำรอง/กู้คืนยังใช้สำหรับสำรองส่วนตัวตามบัญชี Firebase

ข้อมูลสาธารณะร่วมกันประกอบด้วยโลโก้ ชื่อบ้าน ชื่อสมาชิก และ Discord ID; Webhook อยู่ที่ `privateConfig/webhooks` ซึ่งกฎ Firebase อนุญาตให้อ่าน/เขียนได้เฉพาะแอดมิน ส่วนรูปแนบส่งผ่าน Cloud Function ชั่วคราวและไม่บันทึกใน Firebase

## หมายเหตุ
- localStorage ใช้เก็บสำเนาในเครื่อง; ข้อมูลหลักอ่านจาก Firebase เพื่อให้ผู้ใช้เห็นข้อมูลชุดเดียวกัน
- Webhook และรูปแนบชั่วคราวไม่อยู่ในข้อมูลสำรอง
- การสำรองแต่ละครั้งจะสร้างชุดข้อมูลใหม่ในบัญชี Firebase ที่เข้าสู่ระบบ ต้องใช้บัญชีเดิมเมื่อต้องการกู้คืน
- ถ้าโปรเจกต์ Firebase นี้มีแอปอื่นใช้ Realtime Database อยู่ ให้รวมกฎใน `database.rules.json` เข้ากับกฎเดิมก่อนกด Publish
