import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from 'mongoose'

it("fetches the order", async () => {
  // Create a ticket
  const ticket = Ticket.build({id:mongoose.Types.ObjectId().toHexString(), title: "game", price: 150 });
  await ticket.save();
  // Build an order with this ticket
  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);
  // Make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);
});

it("returns an error if one user tries to fetch another users order", async () => {
    // Create a ticket
    const ticket = Ticket.build({id:mongoose.Types.ObjectId().toHexString(), title: "game", price: 150 });
    await ticket.save();
    // Build an order with this ticket
    const user = global.signin();
    const { body: order } = await request(app)
      .post("/api/orders")
      .set("Cookie", user)
      .send({ ticketId: ticket.id })
      .expect(201);
    // Make a request to fetch the order
   
   await request(app)
      .get(`/api/orders/${order.id}`)
      .set("Cookie", global.signin())
      .send()
      .expect(401);
  });