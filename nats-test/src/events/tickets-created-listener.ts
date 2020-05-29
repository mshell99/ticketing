import { Message } from "node-nats-streaming";
import { Listener } from  "@mcstickets/common";
import { TicketCreatedEvent } from "@mcstickets/common"
import { Subjects } from"@mcstickets/common"

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log(data.id);
    console.log(data.price);
    console.log(data.title);

    msg.ack();
  }
}
