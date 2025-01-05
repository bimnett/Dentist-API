const mqtt = require('mqtt');
const CREDENTIAL = require('./credentials');
const TOPIC = require('./databaseMqttTopics');
const mongoose = require("mongoose");
const Timeslot = require('./models/timeslot');
const Clinic = require('./models/clinic');
const Dentist = require('./models/dentist');
const slotManagement = require('./slotManagement');
const dentistSchedule = require('./dentistSchedule');

// MQTT connection options
const options = {
    clientId: 'database_' + Math.random().toString(36).substring(2, 10),
    connectTimeout: 30000,
    reconnectPeriod: 1000
};

const dbURI = CREDENTIAL.mongodb_url;
// Create dentist and patient MQTT clients for and connect
const patientClient = mqtt.connect(CREDENTIAL.patientUrl);
const dentistClient = mqtt.connect(CREDENTIAL.dentistUrl);


// Connect to MongoDB using Mongoose
mongoose.connect(dbURI, { 
    serverSelectionTimeoutMS: 5000,  // Set timeout for DB connection attempts
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

    // Function for publishing
    const recurringPublish = async () => {

        try {
            // Fetch all schedules from the Timeslot collection
            const schedules = await Timeslot.find({});
            console.log('Fetched schedules:', schedules);

            // Ensure schedules are in JSON format
            // Define the topic for publishing cached schedules
            const payload = JSON.stringify(schedules);
            const pubTopic = TOPIC.cached_schedule;

            // Publish the fetched schedules to the MQTT broker
            dentistClient.publish(pubTopic, payload, { qos: 2 }, (err) => {
                if (err) {
                    console.error('Publish error:', err);
                } else {
                    console.log('Cached schedule published successfully at:', Date.now());
                }
            });
        } catch (err) {
            console.error('Error fetching schedules:', err);
        }

        // Schedule the next execution of the task
        setTimeout(recurringPublish, 1000 * 60 * 60 * 6); // Call it every 6th hour for caching in scheduleService.js
    };



// Connect to dentist broker
dentistClient.on('connect', async () => {
    console.log('databaseHandler connected to the dentist broker');

    dentistClient.subscribe('#', { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'#'}`);
        }
    });

    // Fetch all dentist schedules and send to scheduleService for caching
    recurringPublish();
});

// Connect to patient broker
patientClient.on('connect', async () => {
    console.log('databaseHandler connected to the patient broker');

    patientClient.subscribe('#', { qos: 2 }, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribed to topic: ${'#'}`);
        }
    });
});

// Ensure that message event listener is only registered once
dentistClient.on('message', async (topic, message) => {

    // Ignore messages that we send
    if(topic.startsWith('database/response')){
        return;
    }

    try {
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse JSON to enable to save it in db

        console.log('Incoming topic:', topic);

        // Ensure Mongoose connection is ready before saving data
        if (mongoose.connection.readyState !== 1) {
            console.error('Mongoose is not connected to the database.');
            return;
        }

        switch (topic){

            case TOPIC.new_slot_data:
                console.log(jsonMessage);
                const newSlot = new Timeslot(jsonMessage);
                await newSlot.save();
                console.log("New slot saved successfully.");
                break;

            case TOPIC.updated_slot_data:
                console.log("try to update\n");
                var updatedSlot = await slotManagement.update_slot_in_db(jsonMessage);
                console.log(updatedSlot);
                break;

            case TOPIC.dentist_delete_slot:
            case TOPIC.deletion_of_slot:
                console.log("try to delete\n");

                try {
                    const deletedSlot = await Timeslot.findByIdAndDelete(jsonMessage.id);
                    console.log(deletedSlot);

                    let payload = JSON.stringify({data: deletedSlot, error: null});

                    dentistClient.publish(TOPIC.notification_cancel, payload);
                } catch(err){
                    console.log("Error deleting slot:", err);
                    dentistClient.publish(TOPIC.notification_cancel, JSON.stringify({data: null, error: err}));
                }
            
                break;

            case TOPIC.dentist_id:
                console.log('retrive dentist schedule and send to dentist-ui');
                const schedule = dentistSchedule.retrieveDentistSchedule(jsonMessage,dentistClient);
                console.log(schedule);
                break;

            // Queries a specific timeslot ???
            case TOPIC.database_request_find:
                console.log("Processing find request");
                try {
                    const { requestId, query } = jsonMessage;
                    const slot = await Timeslot.findOne(query);

                    // Publish response
                    dentistClient.publish(`${TOPIC.database_response_timeslot}/find`, JSON.stringify({
                        requestId,
                        data: slot,
                        error: null
                    }));

                } catch (error) {

                    // Publish error
                    dentistClient.publish(`${TOPIC.database_response_timeslot}/find`, JSON.stringify({
                        requestId: jsonMessage.requestId,
                        data: null,
                        error: error.message
                    }));
                }
                break;

            // Update a time slot document in the database ???
            case TOPIC.database_request_update:
                console.log("Match found for database_request_update");
                try {
                    const { requestId, query, update } = jsonMessage;
                    const updatedSlot = await Timeslot.findOneAndUpdate(
                        query,
                        update,
                        { new: true } // Return updated document
                    );

                    // Publish response
                    dentistClient.publish(`${TOPIC.database_response_timeslot}/update`, JSON.stringify({
                        requestId,
                        data: updatedSlot,
                        error: null
                    }));

                } catch (error) {
                    console.error("Update error:", error);

                    // Publish error
                    dentistClient.publish(`${TOPIC.database_response_timeslot}/update`, JSON.stringify({
                        requestId: jsonMessage.requestId,
                        data: null,
                        error: error.message
                    }));
                }
                break;

            default:
                console.log("Default case hit. Received topic:", topic);
                break;
        }

    } catch (err) {
        console.error('Error processing message:', err);
    }
});

// Ensure that message event listener is only registered once
patientClient.on('message', async (topic, message) => {

    // Ignore messages that we send
    if(topic.startsWith('database/response')){
        return;
    }

    try {
        const messageString = message.toString();  // Convert Buffer to string
        const jsonMessage = JSON.parse(messageString);  // Parse JSON to enable to save it in db

        console.log('Incoming topic:', topic);

        // Ensure Mongoose connection is ready before saving data
        if (mongoose.connection.readyState !== 1) {
            console.error('Mongoose is not connected to the database.');
            return;
        }

        switch (topic){

            // Finds all available dentists for a clinic and specific date and time
            case TOPIC.database_request_dentists:
                console.log("Processing dentists request");
                try {
                    const { date, time, clinic } = jsonMessage;
                    console.log('Looking for dentists with:', { date, time, clinic });

                    // Find clinic
                    const clinicDoc = await Clinic.findOne({ name: clinic });

                    if (!clinicDoc) {
                        console.log('No clinic found with name:', clinic);
                        patientClient.publish(TOPIC.database_response_dentists, JSON.stringify({
                            data: [],
                            error: null
                        }));
                        return;
                    }

                    // Find dentists - using clinic reference
                    const dentists = await Dentist.find({
                        clinic: clinicDoc._id  // This should work now based on your seed data
                    });
                    console.log('Found dentists:', JSON.stringify(dentists, null, 2));

                    if (!dentists || dentists.length === 0) {
                        console.log('No dentists found for clinic:', clinic);
                        patientClient.publish(TOPIC.database_response_dentists, JSON.stringify({
                            data: [],
                            error: null
                        }));
                        return;
                    }

                    // Find available timeslots
                    const availableDentists = [];
                    for (const dentist of dentists) {
                        const slot = await Timeslot.findOne({
                            date: date,
                            time: time,
                            clinic: clinicDoc._id,
                            dentist: dentist._id,
                            status: 'Available'
                        });

                        console.log('Found slot:', slot);

                        if (slot) {
                            availableDentists.push({
                                id: dentist._id,
                                name: dentist.name,
                                specialty: dentist.specialty,
                                clinic: clinic,
                                clinicId: clinicDoc._id
                            });
                        }
                    }

                    // Publish all available dentists
                    patientClient.publish(TOPIC.database_response_dentists, JSON.stringify({
                        data: availableDentists,
                        error: null
                    }));

                } catch (error) {
                    console.error('Error finding dentists:', error);

                    // Publish error
                    patientClient.publish(TOPIC.database_response_dentists, JSON.stringify({
                        data: null,
                        error: error.message
                    }));
                }
                break;


            // Queries database for all dentists for a specific clinic, date, and time
            case TOPIC.database_request_dentists:
                console.log("Processing dentists request");
                try {
                    const { date, time, clinic } = jsonMessage;
                    console.log('Looking for dentists with:', { date, time, clinic });

                    // First find the clinic
                    const clinicDoc = await Clinic.findOne({ name: clinic });
                    if (!clinicDoc) {
                        throw new Error('Clinic not found');
                    }

                    // Find all dentists for this clinic
                    const dentists = await Dentist.find({
                        clinic: clinicDoc._id
                    });

                    // Now find available timeslots for these dentists
                    const availableDentists = [];
                    for (const dentist of dentists) {
                        const slot = await Timeslot.findOne({
                            date: date,
                            time: time,
                            clinic: clinicDoc._id,
                            dentist: dentist._id,
                            status: 'Available'
                        });

                        if (slot) {
                            availableDentists.push({
                                id: dentist._id,
                                name: dentist.name,
                                specialty: dentist.specialty,
                                clinic: clinic
                            });
                        }
                    }

                    console.log('Available dentists:', availableDentists);

                    patientClient.publish(TOPIC.database_response_dentists, JSON.stringify({
                        data: availableDentists,
                        error: null
                    }));

                } catch (error) {
                    console.error('Error finding dentists:', error);

                    // Publish error
                    patientClient.publish(TOPIC.database_response_dentists, JSON.stringify({
                        data: null,
                        error: error.message
                    }));
                }
                break;

            // Queries all slots for a specific date and clinic
            case TOPIC.database_request_slots:
                console.log("Processing slots request");
                try {
                    const { date, clinic } = jsonMessage;
                    console.log('Looking for slots with:', { date, clinic });
                    // First find the clinic to get its ObjectId
                    const clinicDoc = await Clinic.findOne({ name: clinic });
                    if (!clinicDoc) {
                        throw new Error('Clinic not found');
                    }

                    // Use the clinic's ObjectId in the timeslot query
                    const slots = await Timeslot.find({
                        date: date,
                        clinic: clinicDoc._id,
                        status: 'Available'
                    }).sort('time');

                    console.log('Found slots:', slots);

                    patientClient.publish(TOPIC.database_response_slots, JSON.stringify({
                        data: slots,
                        error: null
                    }));

                } catch (error) {
                    console.error('Error processing slots request:', error);
                    // Publish error
                    patientClient.publish(TOPIC.database_response_slots, JSON.stringify({
                        data: null,
                        error: error.message
                    }));
                }
                break;

            // Reserve time slot
            case TOPIC.database_request_reserve:
                console.log("Processing slot reservation request");
                try {
                    const { dentistId, date, time } = jsonMessage; // Extract slot ID and patient information
                    const dentistIdObjectId = new mongoose.Types.ObjectId(dentistId);
                    console.log(jsonMessage);
                    // Validate the inputs
                    if (!dentistId || !date || !time) {
                        throw new Error('Invalid reservation request. Required fields are missing.');
                    }
                    console.log(`Attempting to reserve slot.`);
                    // Find the timeslot and ensure it is available
                    const timeslot = await Timeslot.findOne({ dentist: dentistIdObjectId, status: 'Available', date: date, time: time });
                    if (!timeslot) {
                        console.error(`Timeslot is not available`);
                        patientClient.publish(TOPIC.database_response_reserve, JSON.stringify({
                            data: null,
                            error: `Timeslot is not available`
                        }));
                        return;
                    }
                    // Update the timeslot to 'Reserved' and assign the patient details
                    timeslot.status = 'Reserved';
                    timeslot.timeOfBooking = Date.now();
                    await timeslot.save();
                    console.log(`Timeslot reserved successfully.`);
                    // Respond with the updated timeslot
                    patientClient.publish(TOPIC.database_response_reserve, JSON.stringify({
                        data: timeslot,
                        error: null
                    }));
                } catch (error) {
                    console.error('Error processing slot reservation:', error.message);
                    // Publish error
                    patientClient.publish(TOPIC.database_response_reserve, JSON.stringify({
                        data: null,
                        error: error.message
                    }));
                }
                break;

                // Book a time slot
            case TOPIC.database_request_book_slot:
                console.log("Processing slot booking request");

                try {
                    const { dentistId, date, time, name, email, phone, treatment } = jsonMessage; // Extract slot ID and patient information
                    const dentistIdObjectId = new mongoose.Types.ObjectId(dentistId);
                    console.log(jsonMessage);

                    // Validate the inputs
                    if (!dentistId || !date || !time) {
                        throw new Error('Invalid reservation request. Required fields are missing.');
                    }

                    const timeslot = await Timeslot.findOne({ dentist: dentistIdObjectId, status: 'Reserved', date: date, time: time });

                    if (!timeslot) {
                        console.error(`Timeslot is not available`);
                        patientClient.publish(TOPIC.database_response_book_slot, JSON.stringify({
                            data: null,
                            error: `Timeslot is not available`
                        }));
                        return;
                    }

                    const generateReferenceCode = () => {
                        const timestamp = Date.now().toString(36); // Base36 timestamp
                        const randomStr = Math.random().toString(36).substring(2, 7); // 5 random chars
                        return `REF-${timestamp}-${randomStr}`.toUpperCase();
                    };

                    timeslot.patient = { name: name, email: email, phone: phone };
                    timeslot.status = "Booked";
                    timeslot.treatment = treatment;
                    timeslot.referenceCode = generateReferenceCode();
                    timeslot.timeOfBooking = Date.now();

                    await timeslot.save();

                    console.log(`Booking successful.`);
                    console.log(timeslot);

                    // Respond with the updated timeslot
                    patientClient.publish(TOPIC.database_response_book_slot, JSON.stringify({
                        data: timeslot,
                        error: null
                    }));

                } catch(error){
                    console.error('Error processing slot booking:', error.message);
                    patientClient.publish(TOPIC.database_response_book_slot, JSON.stringify({
                        data: null,
                        error: error.message
                    }));
                }
                break;

            // Query database for time slot with a specific reference code
            case TOPIC.database_request_reference_code:
                console.log("Processing booking reference code request");

                try {

                    const booking = await Timeslot.findOne({ referenceCode: jsonMessage })
                                                          .populate('dentist', 'name') // Populate dentist with the name field
                                                          .populate('clinic', 'name'); // Populate clinic with the name field

                    if(!booking){
                        console.error(`Booking not found.`);
                        patientClient.publish(TOPIC.database_response_reference_code, JSON.stringify({
                            data: null,
                            error: `Booking not found`
                        }));
                        return;
                    }

                    // Respond with the updated timeslot
                    patientClient.publish(TOPIC.database_response_reference_code, JSON.stringify({
                        data: booking,
                        error: null
                    }));

                } catch(error){
                    console.error('Error processing reference code for booking:', error.message);

                    // Publish error
                    patientClient.publish(TOPIC.database_response_book_slot, JSON.stringify({
                        data: null,
                        error: error.message
                    }));
                }
                break;
        
            // Cancel booking and reset it to available
            case TOPIC.database_request_delete_reference_code:
                console.log("Processing booking deletion request");

                try {

                    const booking = await Timeslot.findOneAndDelete({ referenceCode: jsonMessage });

                    if(!booking){
                        console.error(`Booking not found.`);
                        patientClient.publish(TOPIC.database_response_reference_code, JSON.stringify({
                            data: null,
                            error: `Booking not found`
                        }));
                        return;
                    }

                    // Respond with no error
                    patientClient.publish(TOPIC.database_response_reference_code, JSON.stringify({
                        error: null
                    }));

                } catch(error){
                    console.error('Error processing reference code for booking:', error.message);
                    // Publish error
                    patientClient.publish(TOPIC.database_response_book_slot, JSON.stringify({
                        error: error.message
                    }));
                }
                break;

            case TOPIC.database_request_check_expired_reservations:

                console.log('Checking for expired reservations...');

                try {

                    const { cutOffTime } = jsonMessage;

                    if(!cutOffTime){
                        console.log("Cutoff time is missing from request.")
                        throw new Error("Cutoff time is missing from request.");
                    }

                    // Get all expired reservations
                    // Used for notifying clients of available time slots
                    const expiredSlots = await Timeslot.find({
                        status: 'Reserved',
                        timeOfBooking: { $lt: new Date(cutOffTime) }
                    }).populate('clinic');

                    // Update all expired reservations to available.
                    const result = await Timeslot.updateMany(
                        { // query criteria for expired bookings
                            status: 'Reserved',
                            timeOfBooking: { $lt: new Date(cutOffTime) }
                        },
                        { // Update time slots to available
                            $set: {
                                status: 'Available',
                                patient: null,
                                timeOfBooking: null,
                            }
                        }
                    );

                    console.log(`Updated ${result.modifiedCount} expired reservations`);

                    // Respond with number of updated reservations
                    patientClient.publish(TOPIC.database_response_check_expired_reservations, JSON.stringify(expiredSlots));

                } catch(error){
                    console.log("Error checking expired reservations:", error);

                    // Publish error
                    patientClient.publish(TOPIC.database_response_check_expired_reservations, JSON.stringify({
                        error: error.message
                    }));
                }
                break;

            default:
                console.log("Default case hit. Received topic:", topic);
                break;                
        }

    } catch (err) {
        console.error('Error processing message:', err);
    }
});