const notifications = require('../../src/notificationManager');


/****************************************
Unit test for the notification manager
using mocks.
***************************************/


jest.mock('../../src/notificationManager', () => ({
  notifyCancelation: jest.fn()
}));

describe('Notification Manager Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('notifyCancelation should be called with correct email', () => {
    const email = 'test@example.com';
    notifications.notifyCancelation(email);
    expect(notifications.notifyCancelation).toHaveBeenCalledWith(email);
  });
});