/*
    MongoDB model for timeslot entity
*/
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//todo implement validators
const TimeslotSchema = new Schema({
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['free', 'booked'],
        required: true,
        default: 'free'
    },
    dentist: {
        type: String
    },
    clinic:{
        type: String,
        required: true,
        default: 'Dentist For You'
    },
})

module.exports = mongoose.model('Timeslot', TimeslotSchema);