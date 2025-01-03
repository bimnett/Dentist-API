const SlotAvailabilityService = require('./slotAvailabilityService');
const CREDENTIALS = require('./credentials');

const slotAvailabilityService = new SlotAvailabilityService(
  CREDENTIALS.publicBroker,     // Public broker (for clients)
  CREDENTIALS.internalBroker,   // Internal broker (for services)
);