const SlotBookingService = require('./src/slotBookingService');
const CREDENTIALS = require('./resources/credentials');

const slotBookingService = new SlotBookingService(
  CREDENTIALS.publicBroker,     // Public broker (for clients)
  CREDENTIALS.internalBroker,   // Internal broker (for services)
);