const app = require("../src/index");
const { User } = require("../src/models/user");
const { initdb,disconnect } = require("../src/services/worker");
const request = require("supertest");
describe("test /api/auth/sigup", () => {
    beforeAll(()=>{
        initdb();
    })
    test('Insecure password', (done) => {
        request(app).post("/api/auth/signup").send({name:"test",username:"test",password:"password",email:"test@gmail.com"}).then(res=>{
            expect(res.statusCode).toBe(400);
            expect(res.body.ok).toBe(false);
            expect(res.body.error).toBe("User validation failed: password: your password is not strong");
        }).finally(done);
    });
    test('Successful signup', (done) => {
        request(app).post("/api/auth/signup").send({name:"test",username:"test",password:"Passw0rde@#$",email:"test@gmail.com"}).then(res=>{
            expect(res.statusCode).toBe(200);
            expect(res.body.ok).toBe(true);
            expect(res.body.message).toBe("please verify your email address");
        }).finally(done);
    },6000);

    test('Repetitious username', (done) => {
        request(app).post("/api/auth/signup").send({name:"test",username:"test",password:"Passw0rde@#$",email:"some@gmail.com"}).then(res=>{
            expect(res.statusCode).toBe(409);
            expect(res.body.ok).toBe(false);
            expect(res.body.error).toBe("username already exist");
        }).finally(done);
    });
    test('Bad request', (done) => {
        request(app).post("/api/auth/signup").send({name:"test"}).then(res=>{
            expect(res.statusCode).toBe(400);
            expect(res.body.ok).toBe(false);
            expect(res.body.error).toBe("invalid request data");
        }).finally(done);
    });
    afterAll(done => {
        User.deleteOne({username:"test"}).then(()=>{
            disconnect(done);
        })
    });
});