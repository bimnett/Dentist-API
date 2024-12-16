/*
    MongoDB model for dentist entity
*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DentistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        default: 'General Dentistry'
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    timeslots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timeslot'
    }]
});

module.exports = mongoose.model('Dentist', DentistSchema);