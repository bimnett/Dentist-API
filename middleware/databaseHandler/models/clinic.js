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
        type: Date,
        required: true,
        default: Date.now()
    },
    closeingTime: {
        type: Date,
        required: true,
        default: Date.now()
    }, 
    dentists: {
        type : String
    }
})

module.exports = mongoose.model('Clinic', ClinicSchema);