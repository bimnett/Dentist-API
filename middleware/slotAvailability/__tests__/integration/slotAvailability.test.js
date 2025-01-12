const mqtt = require('mqtt');
const SlotAvailabilityService = require('../../slotAvailabilityService');
const TOPICS = require('../../resources/mqttTopics');

jest.mock('mqtt');

describe('SlotAvailabilityService Integration Tests', () => {
    let service;
    let mockPublicClient;
    let mockInternalClient;
    
    beforeEach(() => {
        mockPublicClient = {
            subscribe: jest.fn((topic, options, callback) => callback(null)),
            publish: jest.fn((topic, payload, options, callback) => callback(null)),
            on: jest.fn(),
            end: jest.fn()
        };
        
        mockInternalClient = {
            subscribe: jest.fn((topic, options, callback) => callback(null)),
            publish: jest.fn((topic, payload, options, callback) => callback(null)),
            on: jest.fn(),
            end: jest.fn()
        };
        
        mqtt.connect.mockImplementation((url) => {
            return url.includes('public') ? mockPublicClient : mockInternalClient;
        });
        
        service = new SlotAvailabilityService('mqtt://public-broker', 'mqtt://internal-broker');
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        service.shutdown();
    });

    describe('Reservation Flow', () => {
        test('should handle complete reservation flow', () => {
            // Initial reservation request
            const slot = {
                date: '2025-01-06',
                time: '10:00',
                clinic: 'Dental Clinic',
                dentist: 'Dr. Smith',
                patient: 'John Doe'
            };
            
            service.handleReservationResponse(slot);
            
            // Verify reservation update published
            expect(mockPublicClient.publish).toHaveBeenCalledWith(
                `${TOPICS.CLIENT_SLOT_UPDATES}/2025-01-06/10:00`,
                expect.stringContaining('RESERVED'),
                { qos: 2 },
                expect.any(Function)
            );
            
            // Verify status update
            service.handleStatusUpdateResponse(slot);
            
            expect(mockPublicClient.publish).toHaveBeenCalledWith(
                `${TOPICS.CLIENT_SLOT_UPDATES}/2025-01-06/10:00`,
                expect.stringContaining('RESERVED'),
                { qos: 2 },
                expect.any(Function)
            );
            
            // Verify all payloads contain required fields
            const reservationPayload = JSON.parse(mockPublicClient.publish.mock.calls[0][1]);
            expect(reservationPayload).toMatchObject({
                type: 'RESERVED',
                date: slot.date,
                time: slot.time,
                clinic: slot.clinic,
                dentistId: slot.dentist,
                patient: slot.patient
            });
            expect(reservationPayload.timestamp).toBeDefined();
        });
    });

    describe('Cleanup Flow', () => {
        test('should handle cleanup process and notifications', () => {
            const expiredSlots = [
                {
                    date: '2025-01-06',
                    time: '10:00',
                    clinic: { name: 'Dental Clinic' },
                    dentist: 'Dr. Smith'
                },
                {
                    date: '2025-01-06',
                    time: '11:00',
                    clinic: { name: 'Dental Clinic' },
                    dentist: 'Dr. Jones'
                }
            ];
            
            // Trigger cleanup response
            service.handleCleanupResponse(expiredSlots);
            
            // Verify notifications for each expired slot
            expect(mockPublicClient.publish).toHaveBeenCalledTimes(4); // 2 slots * 2 notifications each
            
            // Verify clinic notifications
            expect(mockPublicClient.publish).toHaveBeenCalledWith(
                `${TOPICS.CLIENT_SLOT_UPDATES}/2025-01-06/Dental Clinic`,
                expect.any(String),
                { qos: 2 },
                expect.any(Function)
            );
            
            // Verify dentist notifications
            expect(mockPublicClient.publish).toHaveBeenCalledWith(
                `${TOPICS.CLIENT_SLOT_UPDATES}/2025-01-06/10:00/Dental Clinic`,
                expect.any(String),
                { qos: 2 },
                expect.any(Function)
            );
        });

        test('should handle cleanup interval and expired reservations check', () => {
            jest.useFakeTimers();
            
            // Start cleanup interval
            service.startCleanupInterval();
            
            // Fast-forward time
            jest.advanceTimersByTime(60000);
            
            // Verify cleanup request
            expect(mockInternalClient.publish).toHaveBeenCalledWith(
                TOPICS.DATABASE_REQUEST_CHECK_EXPIRED_RESERVATIONS,
                expect.any(String),
                { qos: 2 },
                expect.any(Function)
            );
            
            // Verify cutoff time calculation
            const publishCall = mockInternalClient.publish.mock.calls[0];
            const payload = JSON.parse(publishCall[1]);
            const cutoffTime = new Date(payload.cutOffTime);
            const now = new Date();
            
            // Verify cutoff time is ~15 minutes ago
            expect(now.getTime() - cutoffTime.getTime()).toBeGreaterThanOrEqual(14 * 60 * 1000);
            expect(now.getTime() - cutoffTime.getTime()).toBeLessThanOrEqual(16 * 60 * 1000);
            
            jest.useRealTimers();
        });
    });

    describe('Error Scenarios', () => {
        test('should handle multiple error scenarios in sequence', () => {
            const consoleSpy = jest.spyOn(console, 'error');
            
            // Test sequence of error conditions
            service.handleStatusUpdateResponse(null);
            service.handleReservationResponse(undefined);
            service.handleCleanupResponse([]);
            
            expect(consoleSpy).toHaveBeenCalledTimes(3);
            expect(mockPublicClient.publish).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        test('should handle broker disconnection and reconnection', () => {
            // Simulate broker disconnection
            const closeHandler = mockPublicClient.on.mock.calls.find(call => call[0] === 'close')[1];
            closeHandler();
            
            // Simulate reconnection
            const connectHandler = mockPublicClient.on.mock.calls.find(call => call[0] === 'connect')[1];
            connectHandler();
            
            // Verify resubscription to topics
            expect(mockPublicClient.subscribe).toHaveBeenCalledTimes(1);
        });
    });
});