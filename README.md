# การทดสอบระบบเว็บไซต์ RaiRang (E-Commerce OTOP)

## บทที่ 3 ทำหน้าเว็บสำหรับการทดสอบระบบ (UI Test)

เพื่อประเมินประสิทธิภาพและความถูกต้องของการทำงานของเว็บไซต์ **RaiRang** จึงได้ดำเนินการออกแบบและทดสอบหน้าจอหลักของระบบจำนวน 3 ส่วน ได้แก่

* หน้าแรก (**Homepage**)
* หน้าล็อกอิน (**Login Page**)
* หน้าสมัครสมาชิก (**Registration Page**)

การทดสอบดำเนินการในรูปแบบ **Manual Testing** โดยให้ผู้ทดสอบเข้าใช้งานระบบจริง เพื่อสังเกตพฤติกรรมการตอบสนองของหน้าเว็บในแต่ละขั้นตอน และตรวจสอบว่าผลลัพธ์ที่แสดงออกมาตรงตามที่ระบบคาดหวังหรือไม่

---

### 3.1 Test Script ที่ใช้ในการทดสอบ

| ลำดับ | API Endpoint | Method | วัตถุประสงค์                                              | Expected Result                          | Actual Result                            | สถานะ |
| ----- | ------------ | ------ | --------------------------------------------------------- | ---------------------------------------- | ---------------------------------------- | ----- |
| 1     | /registers   | POST   | ทดสอบการสร้างผู้ใช้ใหม่ (User)                            | ได้สมัครเสร็จสิ้นและเด้งไปหน้าล็อกอิน    | ได้สมัครเสร็จสิ้นและเด้งไปหน้าล็อกอิน    | ✅     |
| 2     | /registers   | POST   | ทดสอบการสร้างผู้ใช้ใหม่ (Entrepreneur)                    | ได้สมัครเสร็จสิ้นและเด้งไปหน้าล็อกอิน    | ได้สมัครเสร็จสิ้นและเด้งไปหน้าล็อกอิน    | ✅     |
| 3     | /registers   | POST   | ทดสอบไม่ใส่ชื่อสมัคร                                      | เด้งข้อความให้ใส่ชื่อ                    | เด้งข้อความให้ใส่ชื่อ                    | ✅     |
| 4     | /registers   | POST   | ทดสอบไม่ใส่ @gmail ตอนสมัคร                               | เด้งข้อความให้ใส่ @gmail                 | เด้งข้อความให้ใส่ @gmail                 | ✅     |
| 5     | /registers   | POST   | ทดสอบไม่ใส่ email ตอนสมัคร                                | เด้งข้อความให้ใส่ email                  | เด้งข้อความให้ใส่ email                  | ✅     |
| 6     | /registers   | POST   | ทดสอบใส่ข้อมูลซ้ำที่มีในระบบ                              | เด้งข้อความว่ามีข้อมูลซ้ำในระบบ          | เด้งข้อความว่ามีข้อมูลซ้ำในระบบ          | ✅     |
| 7     | /register    | POST   | ทดสอบใส่ confirm password ผิด                             | เด้งข้อความว่า confirm password ผิด      | เด้งข้อความว่า confirm password ผิด      | ✅     |
| 8     | /register    | POST   | ทดสอบไม่ใส่ confirm password                              | เด้งข้อความว่าไม่ได้ใส่ confirm password | เด้งข้อความว่าไม่ได้ใส่ confirm password | ✅     |
| 9     | /register    | POST   | ทดสอบไม่ใส่ password                                      | เด้งข้อความว่าไม่ได้ใส่ password         | เด้งข้อความว่าไม่ได้ใส่ password         | ✅     |
| 10    | /register    | POST   | ทดสอบไม่ใส่ password ทั้ง 2 ช่อง                          | เด้งข้อความว่าไม่ได้ใส่ password         | เด้งข้อความว่าไม่ได้ใส่ password         | ✅     |
| 11    | /user/login  | POST   | ทดสอบ login โดยใส่ username และ password ของ User         | เข้าสู่ระบบได้                           | เข้าสู่ระบบได้                           | ✅     |
| 12    | /user/login  | POST   | ทดสอบ login โดยใส่ username และ password ของ Entrepreneur | เข้าสู่ระบบได้                           | เข้าสู่ระบบได้                           | ✅     |
| 13    | /user/login  | POST   | ทดสอบ login โดยใส่ username และ password ที่ไม่มีในระบบ   | ไม่สามารถเข้าสู่ระบบได้                  | ไม่สามารถเข้าสู่ระบบได้                  | ✅     |
| 14    | /user/login  | POST   | ทดสอบ login โดยไม่ใส่ username                            | ไม่สามารถเข้าสู่ระบบได้                  | ไม่สามารถเข้าสู่ระบบได้                  | ✅     |
| 15    | /user/login  | POST   | ทดสอบ login โดยไม่ใส่ password                            | ไม่สามารถเข้าสู่ระบบได้                  | ไม่สามารถเข้าสู่ระบบได้                  | ✅     |

---

### ตัวอย่าง Test Script (Cypress)

```js
// cypress/e2e/register.cy.js
describe('Register Page Test', () => {
  it('ควรสมัครสมาชิกสำเร็จเมื่อกรอกข้อมูลครบถ้วน', () => {
    cy.visit('http://localhost:3000/register');
    cy.get('input[name="username"]').type('testuser01');
    cy.get('input[name="email"]').type('testuser01@gmail.com');
    cy.get('input[name="password"]').type('123456');
    cy.get('select[name="usertype"]').select('Entrepreneur');
    cy.get('button[type="submit"]').click();
    cy.contains('สมัครสมาชิกสำเร็จ').should('be.visible');
  });

  it('ควรแสดงข้อความแจ้งเตือนเมื่อกรอกข้อมูลไม่ครบ', () => {
    cy.visit('http://localhost:3000/register');
    cy.get('input[name="username"]').type('user02');
    cy.get('button[type="submit"]').click();
    cy.contains('กรอกข้อมูลให้ครบ').should('be.visible');
  });
});
```

---

### 3.2 หน้าเว็บที่ใช้ทดสอบ

* **หน้า Home Page**
* **หน้า Login Page**
* **หน้า Register Page**

---

## บทที่ 4 ผลการทดสอบ

### 4.1 การทดสอบ API Test

ดำเนินการทดสอบ API ผ่าน Postman โดยมีการตรวจสอบการตอบสนองของ Endpoint หลัก ได้แก่

* **API Register** — ตรวจสอบการสร้างผู้ใช้ใหม่, ความถูกต้องของข้อมูลที่ส่งไปยังฐานข้อมูล และ Response Code (201 Created)
* **API Login** — ตรวจสอบการยืนยันตัวตนด้วย Username และ Password ที่ถูกต้อง (Response 200 OK)

### 4.2 การทดสอบด้วย Newman

ใช้ **Newman** สำหรับรัน Test Collection จาก Postman เพื่อทดสอบแบบอัตโนมัติ โดยมีผลสรุปดังนี้:

* **API Dashboard** ผ่านการทดสอบทั้งหมด
* **Total Requests:** 20 รายการ (ผ่านทั้งหมด ✅)

### 4.3 การทดสอบ Framework (Cypress)

ทดสอบผ่าน Framework **Cypress** เพื่อจำลองพฤติกรรมผู้ใช้จริงบนเว็บไซต์ เช่น การเข้าสู่ระบบ, สมัครสมาชิก, และตรวจสอบองค์ประกอบ UI โดยได้ผลลัพธ์เป็นไปตามที่คาดหวังทุกกรณี

#### รายการทดสอบที่ดำเนินการ

* `register-user`
* `register-entrepreneur`
* `register-fail-username` (ไม่ใส่ชื่อ)
* `register-fail-email` (ไม่ใส่ @gmail หรือไม่ใส่ email)
* `register-duplicate-username` (ข้อมูลซ้ำในระบบ)
* `register-fail-password` (กรอก confirm password ผิด, ไม่ใส่ password หรือ confirm password)
* `login-user` (ข้อมูลถูกต้อง)
* `login-entrepreneur` (ข้อมูลถูกต้อง)
* `login-fail` (ไม่มีข้อมูลในระบบ, ไม่ใส่ username หรือ password)

---

> ✅ **สรุปผลการทดสอบ:**
> ระบบเว็บไซต์ E-Commerce สำหรับสินค้า OTOP สามารถทำงานได้ถูกต้องตามที่ออกแบบไว้ในทุกกรณี ทั้งในส่วนของ API และ UI โดยผ่านการทดสอบทั้งหมด 20 กรณีโดยไม่มีข้อผิดพลาด
