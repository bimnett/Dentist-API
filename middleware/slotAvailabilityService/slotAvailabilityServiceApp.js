const SlotAvailabilityService = require('./src/slotAvailabilityService');
const CREDENTIALS = require('./resources/credentials');

const slotAvailabilityService = new SlotAvailabilityService(
  CREDENTIALS.publicBroker,     // Public broker (for clients)
  CREDENTIALS.internalBroker,   // Internal broker (for services)
);