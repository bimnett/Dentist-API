const SlotAvailabilityService = require('./slotAvailabilityService');
const credentials = require('./credentials');

const slotAvailabilityService = new SlotAvailabilityService(
  'mqtt://mosquitto:1883',  // External broker (for clients)
  credentials.broker_url,   // Internal broker (for services)
  {
    username: credentials.username,
    password: credentials.password,
  }
);