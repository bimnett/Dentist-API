const slotManagement = require('../../src/slotManagement');


/****************************************
* Unit test for the slot management 
* service using mocks.
****************************************/


jest.mock('../../src/slotManagement', () => ({
  create_new_slot: jest.fn(),
  update_slot: jest.fn(),
  delete_slot: jest.fn()
}));

describe('Slot Management Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create_new_slot should be called with correct message and client', () => {
    const mockMessage = {
      date: '2025-01-07',
      time: '14:00',
      status: 'available',
      dentist: 'Dr. Smith'
    };
    const mockClient = {};
    
    slotManagement.create_new_slot(mockMessage, mockClient);
    expect(slotManagement.create_new_slot).toHaveBeenCalledWith(mockMessage, mockClient);
  });

  test('update_slot should be called with correct message and client', () => {
    const mockMessage = {
      id: '123',
      date: '2025-01-07',
      time: '15:00'
    };
    const mockClient = {};
    
    slotManagement.update_slot(mockMessage, mockClient);
    expect(slotManagement.update_slot).toHaveBeenCalledWith(mockMessage, mockClient);
  });

  test('delete_slot should be called with correct message and client', () => {
    const mockMessage = {
      id: '123'
    };
    const mockClient = {};
    
    slotManagement.delete_slot(mockMessage, mockClient);
    expect(slotManagement.delete_slot).toHaveBeenCalledWith(mockMessage, mockClient);
  });
});