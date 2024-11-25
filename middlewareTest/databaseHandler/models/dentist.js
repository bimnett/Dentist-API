/*
    MongoDB model for dentist entity
*/
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DentistSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
    },
    timetable: [{ type: Schema.Types.ObjectId, ref: 'Timeslot'}],
});

module.exports = mongoose.model('Dentist', DentistSchema);