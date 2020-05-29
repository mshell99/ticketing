import express, { Request, Response } from "express";
import { OrderStatus, BadRequestError } from "@mcstickets/common";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
} from "@mcstickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [body("ticketId").not().isEmpty().withMessage("Ticket Id must be provided")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    //Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    // Make sure that the ticket is not already reserved
    // Run query to look at all orders
    // Find above ticket and orders status is not cancelled

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }
    //Calculate an expiration data for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    // Build the order and save to database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });
    await order.save();
    //Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
