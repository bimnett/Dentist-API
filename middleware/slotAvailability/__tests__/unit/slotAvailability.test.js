const mqtt = require('mqtt');
const SlotAvailabilityService = require('../../slotAvailabilityService');
const TOPICS = require('../../resources/mqttTopics');

// Mock mqtt module
jest.mock('mqtt');

describe('SlotAvailabilityService Unit Tests', () => {
    let service;
    let mockPublicClient;
    let mockInternalClient;
    
    beforeEach(() => {
        // Create mock MQTT clients
        mockPublicClient = {
            subscribe: jest.fn(),
            publish: jest.fn(),
            on: jest.fn(),
            end: jest.fn()
        };
        
        mockInternalClient = {
            subscribe: jest.fn(),
            publish: jest.fn(),
            on: jest.fn(),
            end: jest.fn()
        };
        
        // Mock mqtt.connect to return our mock clients
        mqtt.connect.mockImplementation((url) => {
            return url.includes('public') ? mockPublicClient : mockInternalClient;
        });
        
        // Create service instance
        service = new SlotAvailabilityService('mqtt://public-broker', 'mqtt://internal-broker');
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        service.shutdown();
    });

    describe('Initialization', () => {
        test('should connect to both brokers', () => {
            expect(mqtt.connect).toHaveBeenCalledTimes(2);
            expect(mqtt.connect).toHaveBeenCalledWith('mqtt://public-broker');
            expect(mqtt.connect).toHaveBeenCalledWith('mqtt://internal-broker');
        });
        
        test('should subscribe to required topics', () => {
            expect(mockPublicClient.subscribe).toHaveBeenCalledWith(
                `${TOPICS.SLOT_STATUS_UPDATE}/#`,
                { qos: 2 },
                expect.any(Function)
            );
            
            expect(mockInternalClient.subscribe).toHaveBeenCalledWith(
                'database/response/timeslot/#',
                { qos: 2 },
                expect.any(Function)
            );
        });

        test('should set up event listeners for both clients', () => {
            expect(mockPublicClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockPublicClient.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockPublicClient.on).toHaveBeenCalledWith('close', expect.any(Function));
            
            expect(mockInternalClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockInternalClient.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockInternalClient.on).toHaveBeenCalledWith('close', expect.any(Function));
        });
    });

    describe('Message Publishing', () => {
        test('should publish errors correctly', () => {
            service.publishError('REF123', 'Slot not found');
            
            expect(mockPublicClient.publish).toHaveBeenCalledWith(
                'slot/error',
                expect.stringContaining('REF123'),
                { qos: 2 },
                expect.any(Function)
            );
            
            const publishCall = mockPublicClient.publish.mock.calls[0];
            const payload = JSON.parse(publishCall[1]);
            expect(payload).toMatchObject({
                reference: 'REF123',
                error: 'Slot not found'
            });
            expect(payload.timestamp).toBeDefined();
        });

        test('should handle publish errors', () => {
            const consoleSpy = jest.spyOn(console, 'error');
            
            mockPublicClient.publish.mockImplementationOnce((topic, payload, options, callback) => {
                callback(new Error('Publish failed'));
            });
            
            service.publishToTopic(mockPublicClient, 'test/topic', { data: 'test' }, 'Test message');
            
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Publish error'),
                expect.any(Error)
            );
            
            consoleSpy.mockRestore();
        });
    });

    describe('Response Handlers', () => {
        test('should handle availability check response', () => {
            const slot = {
                _id: '123',
                status: 'Available',
                date: '2025-01-06',
                time: '10:00',
                clinic: 'Dental Clinic',
                dentist: 'Dr. Smith'
            };
            
            service.handleAvailabilityCheckResponse(slot);
            
            expect(mockPublicClient.publish).toHaveBeenCalledWith(
                'slot/123/status',
                expect.any(String),
                { qos: 2 },
                expect.any(Function)
            );
            
            const publishCall = mockPublicClient.publish.mock.calls[0];
            const payload = JSON.parse(publishCall[1]);
            expect(payload).toMatchObject({
                available: true,
                date: slot.date,
                time: slot.time,
                clinic: slot.clinic,
                dentist: slot.dentist
            });
        });

        test('should handle null availability check response', () => {
            const consoleSpy = jest.spyOn(console, 'error');
            service.handleAvailabilityCheckResponse(null);
            
            expect(consoleSpy).toHaveBeenCalledWith('Slot not found or unavailable.');
            expect(mockPublicClient.publish).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('Cleanup', () => {
        test('should properly shutdown service', async () => {
            await service.shutdown();
            
            expect(mockPublicClient.end).toHaveBeenCalled();
            expect(mockInternalClient.end).toHaveBeenCalled();
        });

        test('should clear cleanup interval on shutdown', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            service.startCleanupInterval();
            service.shutdown();
            
            expect(clearIntervalSpy).toHaveBeenCalled();
            clearIntervalSpy.mockRestore();
        });
    });
});