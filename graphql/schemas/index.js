const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Booking {
    _id: ID!,
    createdAt: String!,
    modifiedAt: String!,
    event: Event!,
    user: User!
  }

  type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!,
    user: User!,
    bookings: [Booking!]
  }

  type User {
    _id: ID!
    email: String!
    password: String
    createdEvents: [Event!]
    bookedEvents: [Booking!]
  }

  type UserAuthorization {
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }

  input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!,
    user: ID!
  }

  input UserInput {
    email: String!
    password: String!
  }

  input BookEventInput {
    eventId: ID!
    userId: ID!
  }

  input CancelBookingInput {
    bookingId: ID!
  }

  type RootQuery {
    events: [Event!]!
    bookings: [Booking!]!
    login(email: String, password: String!): UserAuthorization!
  }

  type RootMutation {
    createEvent(input: EventInput): Event
    createUser(input: UserInput): User,
    bookEvent(input: BookEventInput): Booking
    cancelBooking(input: CancelBookingInput): Event
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
