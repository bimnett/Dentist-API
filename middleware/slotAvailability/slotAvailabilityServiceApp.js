const SlotAvailability = require('./slotAvailabilityService');
const CREDENTIALS = require('./resources/credentials');

const slotAvailability = new SlotAvailability(
  CREDENTIALS.publicBroker,     // Public broker (for clients)
  CREDENTIALS.internalBroker,   // Internal broker (for services)
);