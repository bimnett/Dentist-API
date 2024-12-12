function parseEmail(message) {
    try {
        let msgJSON = JSON.parse(message);
        let email = msgJSON.email;
        return email;
    } catch (error) {
        throw new Error("Error parsing the email " + error.message);
    }

}

module.exports = {
    parseEmail,
}