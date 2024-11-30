/*
    MongoDB model for timeslot entity
*/
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//todo implement validators
const TimeslotSchema = new Schema({
    start: {
        type: Date,
        required: true,
        default: Date.now()
    },
    status: {
        type: String,
        enum: ['free', 'booked'],
        required: true,
        default: 'free'
    },
    referenceCode: {
        type: String,
        unique: true
    },
    dentist: {
        type: Schema.Types.ObjectId,
        ref: 'Dentist'
    }
})

module.exports = mongoose.model('Timeslot', TimeslotSchema);