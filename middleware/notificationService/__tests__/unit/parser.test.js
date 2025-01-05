const parser = require('../../src/parser');


/****************************************
Isolated unit tests for the parser
***************************************/


describe('Parser Unit Tests', () => {
    test('parseStatus should correctly identify "Booked" status', () => {
        const message = JSON.stringify({
            appointment: {
                status: 'Booked',
                patient: {
                    email: 'test@example.com'
                }
            }
        });
        expect(parser.parseStatus(message)).toBe('Booked');
    });

    test('parseStatus should correctly identify non-booked status', () => {
        const message = JSON.stringify({
            appointment: {
                status: 'Available',
                patient: {
                    email: 'test@example.com'
                }
            }
        });
        expect(parser.parseStatus(message)).toBe('Available');
    });

    test('parseEmail should extract email from message', () => {
        const message = JSON.stringify({
            appointment: {
                status: 'Booked',
                patient: {
                    email: 'test@example.com'
                }
            }
        });
        expect(parser.parseEmail(message)).toBe('test@example.com');
    });

    test('parseStatus should throw error for missing status', () => {
        const message = JSON.stringify({
            appointment: {
                patient: {
                    email: 'test@example.com'
                }
            }
        });
        expect(() => parser.parseStatus(message)).toThrow('Error parsing the status');
    });

    test('parseEmail should throw error for missing email', () => {
        const message = JSON.stringify({
            appointment: {
                status: 'Booked',
                patient: {}
            }
        });
        expect(() => parser.parseEmail(message)).toThrow('Error parsing the email');
    });

    test('parseEmail should throw error for invalid JSON', () => {
        const message = 'invalid json';
        expect(() => parser.parseEmail(message)).toThrow('Error parsing the email');
    });

    test('parseStatus should throw error for invalid JSON', () => {
        const message = 'invalid json';
        expect(() => parser.parseStatus(message)).toThrow('Error parsing the status');
    });
});