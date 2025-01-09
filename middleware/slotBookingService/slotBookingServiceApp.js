const SlotBookingService = require('./src/slotBookingService');
const CREDENTIALS = require('./resources/credentials');

const SlotBookingService = new SlotBookingService(
  CREDENTIALS.publicBroker,     // Public broker (for clients)
  CREDENTIALS.internalBroker,   // Internal broker (for services)
);