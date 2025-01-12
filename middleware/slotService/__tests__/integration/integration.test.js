const mqtt = require('mqtt');
const TOPIC = require('../../resources/topics');
const slotManagement = require('../../src/slotManagement');
const CREDENTIAL = require('../../resources/credentials');

/*****************************************
 * Integration tests for slot management.
 *****************************************/

describe('Slot Management Service Integration Tests', () => {
    let mainClient;

    beforeEach((done) => {
        mainClient = mqtt.connect(CREDENTIAL.brokerUrl, {
            clientId: 'slotService_test_' + Math.random().toString(36).substring(2, 10)
        });

        mainClient.on('connect', () => {
            mainClient.subscribe(TOPIC.create_new_slot, { qos: 2 }, (err) => {
                if (!err) {
                    done();
                }
            });
        });
    });

    afterEach((done) => {
        mainClient.end(true, done);
    });

    test('should handle slot creation message', (done) => {
        const testMessage = {
            date: '2025-01-07',
            time: '14:00',
            status: 'available',
            patient: null,
            dentist: 'Dr. Smith',
            clinic: 'Downtown Dental',
            treatment: 'Checkup'
        };

        mainClient.on('message', (topic, message) => {
            if (topic === TOPIC.create_new_slot) {
                try {
                    expect(() => {
                        slotManagement.create_new_slot(message, mainClient);
                    }).not.toThrow();
                    done();
                } catch (error) {
                    done(error);
                }
            }
        });

        mainClient.publish(TOPIC.create_new_slot, JSON.stringify(testMessage), { qos: 2 });
    });
});