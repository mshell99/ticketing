import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@mcstickets/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
