import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({ title: "adfasd", price: 20 })
    .expect(404);
});

it("returns a 401 if theuser is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "adfasd", price: 20 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "adfasd", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "asdasdf",
      price: 10000,
    })
    .expect(401);
});

it("returns a 400 if the user provides and invalid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "adfasd", price: 20 });
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "concert", price: -100 })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "adfasd", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "New Title",
      price: 100,
    })
    .expect(200);
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual("New Title");
  expect(ticketResponse.body.price).toEqual(100);
});

it("publishes an event", async () => {
  const title = "gfhdfgh";

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title, price: 30 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "adfasd", price: 20 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "New Title",
      price: 100,
    })
    .expect(400);
});
