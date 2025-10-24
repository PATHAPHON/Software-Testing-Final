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
    cy.get('input[placeholder="password"]').click().type('222212345678900');
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
    cy.wait(4000);
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
    cy.get('input[placeholder="password"]').click().type('E12345678999');
    cy.get('label:nth-child(4) input[value]').click().type('E12345678999');
    cy.get('select.w-full').select('entrepreneur'); // เลือกบทบาทผู้ประกอบการ
    cy.get('button.w-full').click();
    cy.wait(4000);

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
    cy.wait(4000);
  });

  it('register-fall-username-ไม่ใส่ชื่อ', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser002@gmail.com');
    cy.get('input[placeholder="password"]').click();
    cy.get('input[placeholder="password"]').type('123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('123456789');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(4000);
  });

  it('register-fall-email-ไม่ใส่@gmail.com', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser002');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser002');
    cy.get('input[placeholder="password"]').click();
    cy.get('input[placeholder="password"]').type('123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('123456789');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(4000);
  });
  it('register-fall-email-ไม่ใส่email', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser002');
    cy.get('input[placeholder="password"]').click();
    cy.get('input[placeholder="password"]').type('123456789');
    cy.get('label:nth-child(4) input[value]').click();
    cy.get('label:nth-child(4) input[value]').type('123456789');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(4000);
  });
  it('register-username-ใส่ข้อมูลซ้ำที่มีในระบบ', function() {
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
    cy.wait(4000);
  });

  
});

describe('register-password', () => {

  it('register-fall-passoword-comform password ผิด', function() {
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
    cy.wait(4000);
    
  });
  

  it('register-fall-Password-ไม่ใส่ข้อมูล Confirm-Password', function() {
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
    cy.wait(4000);
  });

  it('register-fall-password-ไม่ใส่ข้อมูล password', function() {
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
    cy.wait(4000);
  });

  it('register-fall-password-ไม่มีข้อมูล password ทั้ง2', function() {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.font-medium').click();
    cy.get('input[placeholder="yourname"]').click();
    cy.get('input[placeholder="yourname"]').type('tastuser001');
    cy.get('input[placeholder="you@example.com"]').click();
    cy.get('input[placeholder="you@example.com"]').type('tastuser001@gmail.com');
    cy.get('select.w-full').select('user');
    cy.get('button.w-full').click();
    cy.wait(4000);
  });
});


describe('login', () => {
  it('login-user-ข้อมูลที่มีในระบบ', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Pat22220');
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('2222123456789');
    cy.get('button.shadow').click();
    cy.wait(5000);
    
  });
  it('login-entrepreneur-ข้อมูลที่มีในระบบ', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Entrepreneur001');
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('E123456789');
    cy.get('button.shadow').click();
    cy.wait(5000);
  });

  it('login-userandentrepreneur-ข้อมูลที่ไม่มีในระบบ', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Pawefwef220');
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('2222123wefwfefewf456789');
    cy.get('button.shadow').click();
    cy.wait(5000);
    
  });
  it('login-userandentrepreneur-ไม่มี user', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="••••••••"]').click();
    cy.get('input[placeholder="••••••••"]').type('2222123wefwfefewf456789');
    cy.get('button.shadow').click();
    cy.wait(5000);
    
  });

  it('login-userandentrepreneur-ไม่มี password', () => {
    cy.visit('http://localhost:3000/')
    cy.get('li.transition').click();
    cy.get('button.border').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').click();
    cy.get('input[placeholder="เช่น pathaphon.s"]').type('Pawefwef220');
    cy.get('button.shadow').click();
    cy.wait(5000);
    
  });
  


});

describe('tast-tan', () => {
  it ('tast', function() {
    cy.visit('http://localhost:3000/')
    
  });


    
});


describe('Newman - bulk random register', () => {
  it.skip('register-user 10 random accounts', () => {
    const runs = 10;
    const interceptedData = [];
    const formSubmissions = []; // เก็บ credentials แต่ละรอบ เพื่อบันทึกลงไฟล์

    // ดักจับ POST /registers (หรือ pattern ที่คุณใช้)
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

    // ทำซ้ำ runs ครั้ง — Cypress._ เป็น lodash ที่มากับ Cypress
    Cypress._.times(runs, (i) => {
      // สร้าง credential แบบสุ่ม (คุณสามารถปรับรูปแบบได้)
      const rand = Cypress._.random(100000, 999999);
      const username = `pat${Date.now().toString().slice(-5)}${rand}`; // ตัวอย่าง: pat12345234567
      const email = `${username}@example.com`;
      // สร้างรหัสผ่านความยาว ~12-16 ตัว (ตัวอย่างผสมตัวเลข+ตัวอักษร)
      const password = `${Cypress._.sample(['A','B','C','d','e','f','g','h','X','Y','Z'])}${Cypress._.random(10000000, 99999999)}${Cypress._.sample(['!','@','#'])}`;

      // บันทึกตัวอย่างข้อมูลฟอร์มที่จะเขียนไฟล์ทีหลัง
      formSubmissions.push({ iteration: i + 1, username, email, passwordMasked: '********' });

      // —- คิวคำสั่ง Cypress สำหรับแต่ละรอบ —
      cy.visit('http://localhost:3000/');

      cy.get('li.transition').click();
      cy.get('button.font-medium').click();

      // กรอกฟอร์ม
      cy.get('input[placeholder="yourname"]').clear().type(username);
      cy.get('input[placeholder="you@example.com"]').clear().type(email);

      // ถ้าฟิลด์ password ใช้ placeholder อื่น ให้แก้ให้ตรงกับแอปของคุณ
      cy.get('input[placeholder="password"]').clear().type(password);

      // สมมติช่องยืนยันรหัสผ่านเป็น label:nth-child(4) input[value]
      cy.get('label:nth-child(4) input[value]').clear().type(password);

      // เลือก role (user หรือ entrepreneur)
      cy.get('select.w-full').select('user');

      // ส่งฟอร์ม
      cy.get('button.w-full').click();

      // รอ request (ถ้ามี) — ใช้ .optional เพื่อไม่ให้ fail ถ้าไม่มี POST จริง ๆ
      cy.wait('@anyApiPost', { timeout: 15000 }).optional;
    });

    // หลังทำครบทุกรอบ: เขียนไฟล์ JSON เก็บข้อมูล
    cy.then(() => {
      const payloadToSave = {
        timestamp: new Date().toISOString(),
        runs,
        page: 'register',
        formSamples: formSubmissions,
        networkIntercepts: interceptedData,
      };

      cy.writeFile('cypress/fixtures/intercepted_post_data_Newman.json', payloadToSave, { log: true });
    });
  });
});
