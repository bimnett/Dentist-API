function parseEmail(message) {
    try {
        let msgJSON = JSON.parse(message.toString());
        let email = msgJSON.patient.email;
        return email;
    } catch (error) {
        throw new Error("Error parsing the email " + error.message);
    }

}

function parseStatus(message){
    try {
        let msgJSON = JSON.parse(message.toString());
        let status = msgJSON.status;
        return status;
    } catch (error) {
        throw new Error("Error parsing the status " + error.message);
    }
}

module.exports = {
    parseEmail,
    parseStatus,
}