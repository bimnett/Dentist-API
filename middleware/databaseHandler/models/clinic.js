const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ClinicSchema = new Schema({
    name: {
        type:String,
        require: true
    }, 
    location: {
        type: String,
        require: true
    }, 
    openingTime: {
        type: String,
        required: true,
        default: "09:00" // can change later
    },
    closingTime: {
        type: String,
        required: true,
        default: "18:00" // can change later
    }, 
    dentists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dentist'
    }]
})

module.exports = mongoose.model('Clinic', ClinicSchema);