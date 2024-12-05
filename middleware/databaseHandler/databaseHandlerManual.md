# DB Handler Dev Manual
## Running the service
1. Before running the service, add the following topic to your `credentials.js` file and locate it inside middlware but outside databaseHandler directory. Insert related data for broker_url, username, password, and mongodb_url.
```
module.exports = {
    // MQTT broker credentials 
    broker_url: 'BROKER_URL',
    username: 'YOUR_USERNAME',
    password: 'YOUR_PASSWORD',

    // MongoDB URI
    mongodb_url: 'MONGODB_URL',
};
```
2. To start the service, run following command in a separate terminal window:
``npm run serveDbHandler``

## Add the seed files
1. Populate MongoDB with dentist, clinic, and timeslot data by running the following scripts:
``node seeds/seedClinics.js``
``node seeds/seedDentists.js``
``node seeds/seedTimeslots.js``

## Using the service
DB Handler currently handles messages received from the following topics:
1. `TOPIC_DATABASE_INSERT`:
   1. **Expected Input**: timeslot in json format
   2. **Output**: success/error message
   3. **Description**: Will add a timeslot to the db if valid
2. `TOPIC_DATABASE_RETRIEVE`:
    1. **Expected Input**: none
    2. **Output**: timeslots in json format
    3. **Description**: Will return all the timeslots in the db

`TOPIC_DATABASE_UPDATE`: is **not yet implemented**.