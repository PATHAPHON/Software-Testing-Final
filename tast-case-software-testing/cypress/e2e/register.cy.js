describe('register', () => {
  it.skip('register-user', () => {
    const interceptedData = [];

    cy.intercept('POST', '**/registers', (req) => {
      req.continue((res) => {
        interceptedData.push({
          url: req.url,
          method: req.method,
          requestBody: req.body,
          statusCode: res?.statusCode,
          responseBody: res?.body,
        });
      });
    }).as('anyApiPost');

    cy.visit('http://localhost:3000/');

    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click().type('Pat2222000');
    cy.get('input[placeholder="you@example.com"]').click().type('Pat2222000@gmail.com');
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').click().type('222212345678900');
    cy.get('label:nth-child(4) input[value]').click().type('222212345678900');
    cy.get('select.w-full').select('user'); // ตัวอย่างการเลือก dropdown สมารถจะแก้เป็น user กับ entrepreneur ได้
    cy.get('button.w-full').click();

    // ถ้ามี request ก็รออย่างน้อย 1 ตัว (กัน timing)
    // ถ้าแอปคุณไม่มี POST จริง ๆ บรรทัดนี้จะข้ามได้ (ดูบล็อก cy.then ด้านล่าง)
    cy.wait('@anyApiPost', { timeout: 15000 }).optional; // ใช้ .optional ใน Cypress v13 ขึ้นไป

    // ---- บันทึกไฟล์ JSON หลังจากทุกอย่างเสร็จ ----
    cy.then(() => {
      const payloadToSave = {
        timestamp: new Date().toISOString(),
        page: 'register',
        formExample: { // ตัวอย่างข้อมูลฟอร์มที่เราส่ง (หากอยากดึงสด ๆ ให้เก็บจาก .invoke('val') ทีละช่อง)
          name: 'Pat0',
          email: 'Pat0@gmail.com',
          password: '*********',
        },
        networkIntercepts: interceptedData, // รายการ request/response ที่ดักไว้
      };

      // เขียนไฟล์ไปที่ fixtures (ปรับพาธได้)
      cy.writeFile(
        'cypress/fixtures/intercepted_post_data.json',
        payloadToSave,
        { log: true }
      );
    });
  });

  it.skip('register-entrepreneur', () => {
    const interceptedData = [];
    cy.intercept('POST', '**/registers', (req) => {
      req.continue((res) => {
        interceptedData.push({
          url: req.url,
          method: req.method,
          requestBody: req.body,
          statusCode: res?.statusCode,
          responseBody: res?.body,
        });
      });
    }).as('anyApiPost');

    cy.visit('http://localhost:3000/');

    // เปิดหน้า Register (ปรับ selectors ให้ตรงกับแอปจริง)
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();

    // กรอกฟอร์มสำหรับผู้ประกอบการ
    cy.get('input[placeholder="yourname"]').click().type('Entrepreneur00199');
    cy.get('input[placeholder="you@example.com"]').click().type('entrepreneur00199@example.com');
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').click().type('E12345678999');
    cy.get('label:nth-child(4) input[value]').click().type('E12345678999');
    cy.get('select.w-full').select('entrepreneur'); // เลือกบทบาทผู้ประกอบการ
    cy.get('button.w-full').click();
    cy.wait(2000);

    // ถ้ามี request จริง ให้รอ (ถ้าไม่มี ระบบจะไม่ fail เพราะใช้ .optional)
    cy.wait('@anyApiPost', { timeout: 15000 }).optional;

    // บันทึกผลลัพธ์ intercept + ตัวอย่างข้อมูลฟอร์มลงไฟล์แยก
    cy.then(() => {
      const payloadToSave = {
        timestamp: new Date().toISOString(),
        page: 'register-entrepreneur',
        role: 'entrepreneur',
        formExample: {
          name: 'Entrepreneur001',
          email: 'entrepreneur001@example.com',
          password: '*********',
        },
        networkIntercepts: interceptedData,
      };

      cy.writeFile(
        'cypress/fixtures/intercepted_post_data_entrepreneur.json',
        payloadToSave,
        { log: true }
      );
    });
  });

  it.skip('register-fall-username-ไม่ใส่ชื่อ', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser002@gmail.com');
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').click();
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').type('123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('123456789');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
  });

  it.skip('register-fall-email-ไม่ใส่@gmail.com', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser002');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser002');
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').click();
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').type('123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('123456789');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
  });
  it.skip('register-fall-email-ไม่ใส่email', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser002');
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').click();
    cy.get('input[placeholder="อย่างน้อย 6 ตัวอักษร"]').type('123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('123456789');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
  });
  it.skip('register-username-ใส่ข้อมูลซ้ำที่มีในระบบ', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('Entrepreneur001');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('entrepreneur001@example.com');
    cy.get('input[placeholder="password"]').click();
    cy.get('input[placeholder="password"]').type('E123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('E123456789');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
  });

  
});

describe('register-password', () => {

  it.skip('register-fall-passoword-comform password ผิด', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('Entrepreneur001');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('entrepreneur001@example.com');
    cy.get('input[placeholder="password"]').click();
    cy.get('input[placeholder="password"]').type('E123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('E1234567889wrong');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
    
  });
  

  it.skip('register-fall-Password-ไม่ใส่ข้อมูล Confirm-Password', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser001');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser001@gmail.com');
    cy.get('input[placeholder="password"]').click();
    cy.get('input[placeholder="password"]').type('1234567');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
  });

  it.skip('register-fall-password-ไม่ใส่ข้อมูล password', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser001');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser001@gmail.com');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('123456');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
  });

  it.skip('register-fall-password-ไม่มีข้อมูล password ทั้ง2', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser001');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser001@gmail.com');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(2000);
  });
});


describe('login', () => {
  it.skip('login-user-ข้อมูลที่มีในระบบ', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Pat22220');
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('2222123456789');
    cy.get('button.shadow').click();
    cy.wait(10000);
    
  });
  it.skip('login-entrepreneur-ข้อมูลที่มีในระบบ', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Entrepreneur001');
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('E123456789');
    cy.get('button.shadow').click();
    cy.wait(10000);
  });

  it.skip('login-userandentrepreneur-ข้อมูลที่ไม่มีในระบบ', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Pawefwef220');
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('2222123wefwfefewf456789');
    cy.get('button.shadow').click();
    cy.wait(10000);
    
  });
  it.skip('login-userandentrepreneur-ไม่มี user', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('2222123wefwfefewf456789');
    cy.get('button.shadow').click();
    cy.wait(10000);
    
  });

  it('login-userandentrepreneur-ไม่มี password', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Pawefwef220');
    cy.get('button.shadow').click();
    
  });
  

  
});


