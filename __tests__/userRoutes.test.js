const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");


describe("User Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
  });

  describe("GET /", function () {
    test("can see a list of users", async function () {
      let response = await request(app).get("/users");
      expect(response.statusCode).toEqual(200);
      expect(response).toEqual([{
        "username": "test1",
        "first_name": "Test1",
        "last_name": "Testy1",
        "phone": "+14155550000"
      }])
    });
  });
});