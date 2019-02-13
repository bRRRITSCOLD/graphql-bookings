/* models */
const { Eventt, Eventts } = require('../../models/events');
const { User } = require('../../models/users');
const { Bookings } = require('../../models/bookings');

module.exports.findEvent = async (eventId) => {
  try {
    const event = await Eventt.findOne(eventId);
    return {
      ...event,
      date: new Date(event.date).toISOString(),
      user: this.findUser.bind(this, event.user),
      bookings: this.findBookings.bind(this, event.bookings)
    };
  } catch (err) {
    throw err;
  }
};

module.exports.findEvents = async (eventIds) => {
  try {
    const events = await Eventts.findIn(eventIds);
    return events.map((event) => {
      return {
        ...event,
        date: new Date(event.date).toISOString(),
        user: this.findUser.bind(this, event.user),
        bookings: this.findBookings.bind(this, event.bookings)
      }
    });
  } catch (err) {
    throw err;
  }
};

module.exports.findUser = async (userId) => {
  try {
    const user = await User.findOne(userId);
    return {
      ...user,
      password: undefined,
      createdEvents: this.findEvents.bind(this, user.createdEvents),
      bookedEvents: this.findBookings.bind(this, user.bookedEvents)
    }
  } catch (err) {
    throw err;
  }
};

module.exports.findBookings = async (bookingIds) => {
  try {
    const bookings = await Bookings.findIn(bookingIds);
    return bookings.map((booking) => {
      return { 
        ...booking,
        createdAt: new Date(booking.createdAt).toISOString(),
        modifiedAt: new Date(booking.modifiedAt).toISOString(),
        user: this.findUser.bind(this, booking.userId),
        event: this.findEvent.bind(this, booking.eventId)
       }
    });  
  } catch (err) {
    throw err;
  }
};
