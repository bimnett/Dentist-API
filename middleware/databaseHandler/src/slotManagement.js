const Timeslot = require('../models/timeslot');

async function update_slot_in_db(jsonMessage){
    try{
        const updatedSlot = await Timeslot.findByIdAndUpdate(
            jsonMessage._id, // the _id of the timeslot to update
            { 
                date: jsonMessage.date, // New date
                time: jsonMessage.time, // New time
                treatment: jsonMessage.treatment // New treatment type
            },
            { 
                new: true, // Return the updated document, not the original one
                runValidators: true // see so the values fit the Timeslot schema
            }
        );
        return updatedSlot;
    }catch(err){
        console.log(err);
    }
};


module.exports = {
    update_slot_in_db
}