/*
    MongoDB model for timeslot entity
*/
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TimeslotSchema = new Schema({
    start: {
        type: Date,
        required: true,
        default: Date.now()
    },
    end: {
        type: Date,
        required: true,
        default: new Date(Date.now().getTime() + 3600*1000) // set default end to an hour from now
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