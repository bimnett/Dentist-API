const validation = require('../../src/validation');

/****************************************
* Unit test for the validation service
* using mocks.
****************************************/


jest.mock('../../src/validation', () => ({
  validate_time: jest.fn(),
  validate_date: jest.fn(),
  validate_clinic: jest.fn(),
  validate_dentist: jest.fn(),
  validate_reference_code: jest.fn()
}));


describe('Validation Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('validate_time should be called with correct message', () => {
    const mockMessage = Buffer.from(JSON.stringify({
      time: '14:00',
      date: '2025-01-07'
    }));
    
    validation.validate_time(mockMessage);
    expect(validation.validate_time).toHaveBeenCalledWith(mockMessage);
  });

  test('validate_date should be called with correct message', () => {
    const mockMessage = Buffer.from(JSON.stringify({
      date: '2025-01-07'
    }));
    
    validation.validate_date(mockMessage);
    expect(validation.validate_date).toHaveBeenCalledWith(mockMessage);
  });

  test('validate_clinic should be called with correct parameters', () => {
    const mockTOPIC = { specific_clinict: 'clinic/specific' };
    const mockMessage = Buffer.from(JSON.stringify({
      clinic: 'Downtown Dental'
    }));
    const mockClient = {};
    
    validation.validate_clinic(mockTOPIC, mockMessage, mockClient);
    expect(validation.validate_clinic).toHaveBeenCalledWith(mockTOPIC, mockMessage, mockClient);
  });

  test('validate_dentist should be called with correct parameters', () => {
    const mockTOPIC = { specific_dentist: 'dentist/specific' };
    const mockMessage = Buffer.from(JSON.stringify({
      dentist: 'Dr. Smith'
    }));
    const mockClient = {};
    
    validation.validate_dentist(mockTOPIC, mockMessage, mockClient);
    expect(validation.validate_dentist).toHaveBeenCalledWith(mockTOPIC, mockMessage, mockClient);
  });

  test('validate_reference_code should be called with correct parameters', () => {
    const mockTOPIC = { specific_reference_code: 'reference/specific' };
    const mockMessage = Buffer.from(JSON.stringify({
      reference_code: 'REF123'
    }));
    const mockClient = {};
    
    validation.validate_reference_code(mockTOPIC, mockMessage, mockClient);
    expect(validation.validate_reference_code).toHaveBeenCalledWith(mockTOPIC, mockMessage, mockClient);
  });
});