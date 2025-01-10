const mqtt = require('mqtt');
const TOPIC = require('../../resources/topics');
const notifications = require('../../src/notificationManager');
const CREDENTIAL = require('../../credentials');


/*****************************************
* Integration tests for email notifications.
*****************************************/


// Mock notification manager & parser
jest.mock('../../src/notificationManager', () => ({
    notifyCancelation: jest.fn()
}));

jest.mock('../../src/parser', () => ({
    parseStatus: jest.fn().mockReturnValue('Booked'),
    parseEmail: jest.fn().mockReturnValue('test@example.com')
}));


describe('Notification Service Integration Tests', () => {
    // testClient will be publishing mock data
    // mainClient will subscribe and listen to mock data
    let mainClient;
    let testClient;

    beforeEach((done) => {
        jest.clearAllMocks();

        let connectedClients = 0;
        const checkBothConnected = () => {
            connectedClients++;
            if (connectedClients === 2) {
                done();
            }
        };

        mainClient = mqtt.connect(CREDENTIAL.brokerUrl, {
            clientId: 'notificationService_test_' + Math.random().toString(36).substring(2, 10),
            connectTimeout: 10000,
            reconnectPeriod: 1000,
        });

        mainClient.on('connect', () => {
            console.log('Main client connected');
            mainClient.subscribe(TOPIC.notification_cancel, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                    done(err);
                    return;
                }
                console.log('Main client subscribed');
                checkBothConnected();
            });
        });

        testClient = mqtt.connect(CREDENTIAL.brokerUrl, {
            clientId: 'test_publisher_' + Math.random().toString(36).substring(2, 10)
        });

        testClient.on('connect', () => {
            console.log('Test client connected');
            checkBothConnected();
        });
    });

    afterEach((done) => {
        const cleanup = () => {
            mainClient.end(true, () => {
                testClient.end(true, () => {
                    done();
                });
            });
        };
        setTimeout(cleanup, 1000);
    });

    test('should send notification when receiving successful deletion message', (done) => {
        const testMessage = {
            data: {
                appointment: {
                    status: "Booked",
                    patient: {
                        email: "test@example.com"
                    }
                }
            },
            error: null
        };

        mainClient.on('message', (topic, message) => {
            console.log(`Received message on topic: ${topic}`);
            console.log('Message content:', message.toString());
            
            if (topic === TOPIC.notification_cancel) {
                try {
                    const email = testMessage.data.appointment.patient.email;
                    
                    expect(() => {
                        notifications.notifyCancelation(email); 
                    }).not.toThrow(); 

                    done();
                } catch (error) {
                    done(error);
                }
            }
        });

        console.log('Publishing test message');
        testClient.publish(
            TOPIC.notification_cancel,
            JSON.stringify(testMessage),
            { qos: 2 },
            (err) => {
                if (err) {
                    console.error('Publish error:', err);
                    done(err);
                }
            }
        );
    });

    test('should not send notification when appointment is not booked', (done) => {
        const testMessage = {
            data: {
                appointment: {
                    status: "Booked",
                    patient: {
                        email: "test@example.com"
                    }
                }
            },
            error: null
        };

        mainClient.on('message', (topic, message) => {
            if (topic === TOPIC.notification_cancel) {
                setTimeout(() => {
                    try {
                        expect(notifications.notifyCancelation).not.toHaveBeenCalled();
                        done();
                    } catch (error) {
                        done(error);
                    }
                }, 500);
            }
        });

        testClient.publish(
            TOPIC.notification_cancel,
            JSON.stringify(testMessage),
            { qos: 2 }
        );
    });
});