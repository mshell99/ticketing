import { Publisher, OrderCreatedEvent, Subjects } from "@mcstickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
