/*
    MongoDB model for timeslot/booking entity
*/
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

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
        enum: ['Available', 'Booked'],
        required: true,
        default: 'Available'
    },
    patient: {
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
    },
    dentist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist',
        required: true,
    },
    // clinic:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Clinic',
    //     required: true,
    // },
    treatment: {
        type: String,
        enum: ['General', 'Teeth Whitening', 'Tooth Extraction', 'Implant Insertion', 'Laminated Tooth Veneer', 'Tooth Filling', 'Teeth Cleaning', 'Root Canal Treatment'],
        required: false,
        default: 'General'
    },
    referenceCode: {
        type: String,
        required: false,
    }
})

module.exports = mongoose.model('Timeslot', TimeslotSchema);