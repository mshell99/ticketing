import request from "supertest";
import { app } from "../../app";

it("should reject users who are not signed up", async () => {
  return request(app).post("/api/users/signin").send({
    email: "foo@foo.dk",
    password: "test",
  });
});

it("fails when an incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test2@test.com",
      password: "abcde",
    })
    .expect(201);
  return request(app).post("/api/users/signin").send({
    email: "test2@test.com",
    password: "test",
  });
});


it('responds with a cookie when given valid credentials',async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test2@test.com",
        password: "test",
      })
      .expect(201);
    const response = await request(app).post("/api/users/signin").send({
      email: "test2@test.com",
      password: "test",
    }).expect(200);
    expect (response.get('Set-Cookie')).toBeDefined()
  });
