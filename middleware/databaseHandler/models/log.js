const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = {
    timeStamp : { 
        type: String,
        require: true
    },
    user: {
        type: String,
        require: false,
        enum: ['patient', 'dentist'],
        default: null 
    },
    failure: {
        type: String,
        require: false,
        //enum: [],
        default: null
    },
    reason: {
        type: String,
        require: false
    }
};