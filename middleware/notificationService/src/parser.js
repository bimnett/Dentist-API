// src/parser.js

function parseStatus(message) {
    try {
        const data = JSON.parse(message);
        const status = data.data.appointment?.status;
        if (!status) {
            throw new Error("Status not found in message");
        }
        return status;
    } catch (error) {
        throw new Error("Error parsing the status: " + error.message);
    }
}

function parseEmail(message) {
    try {
        const data = JSON.parse(message);
        const email = data.data.appointment?.patient?.email;
        if (!email) {
            throw new Error("Email not found in message");
        }
        return email;
    } catch (error) {
        throw new Error("Error parsing the email: " + error.message);
    }
}

module.exports = {
    parseStatus,
    parseEmail
};