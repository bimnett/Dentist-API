# DB Handler Dev Manual
## Running the service
1. Before running the service, add following topic to your `.env` file, if any are missing: 
```
TOPIC_DATABASE_INSERT = database/insert
TOPIC_DATABASE_RETRIEVE = database/retrieve
TOPIC_DATABASE_UPDATE = database/update
TOPIC_DATABASE_INSERT_RESPONSE = database/response/insert
TOPIC_DATABASE_RETRIEVE_RESPONSE = database/response/retrieve
TOPIC_DATABASE_UPDATE_RESPONSE = database/response/update
```
2. To start the service, run following command in a separate terminal window:
``npm run serveDbHandler``

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