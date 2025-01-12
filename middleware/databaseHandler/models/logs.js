const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LogsSchema = new Schema({
    topic: {
        type:String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Log', LogSchema);