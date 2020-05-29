import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({ title: "game", price: 5, userId: "123" });
  //Save it to the database
  await ticket.save();
  //Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  //make two separate changes to tickets
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });
  // save the first fetched ticket
  await firstInstance!.save();
  //save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }
  throw new Error("should not reach this point");
});

it ('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title:'concert',
        price: 20,
        userId: '123'
    })
    await ticket.save()
    expect(ticket.version).toEqual(0)

    await ticket.save()
    expect(ticket.version).toEqual(1)

    await ticket.save()
    expect(ticket.version).toEqual(2)
})