

// dentist creats new avaliable time slot
async function create_new_slot(topic,message){

    // when reciving info about the new slot
    try{
        var returnMessage= "The slot has been created (send confimation from db that the slot has been savde too)";
        //convert message to json
        const jsonMessage = JSON.parse(message);
        /*
        console.log("topic: "+topic);
        console.log("message:\n" + jsonMessage);
        console.log(`Received message: + ${message} + on topic: + ${topic} :` + '\norigin : slotManagement.js');
        */

        const time = jsonMessage.time;
        const date = jsonMessage.date;
        const dentist = jsonMessage.dentist;
        const clinic = jsonMessage.clinic;
        console.log("create slot for this date: "+ date);
        console.log("the slot has been created succesfully");

        // only need to forward the info with pub to db with the rigth topic 


        
        return returnMessage;

    } catch (error){
        console.log(error);
    }
    
};

async function validate_time(message){
    try {
        var returnMessage = "";
        const jsonMessage = JSON.parse(message);
        const time = jsonMessage.time;
        const date = jsonMessage.date;

        const currentDate = new Date().toJSON().slice(0, 10);
        const currentTime = new Date().toJSON().slice(15,20);

        // valid time 00:00-23:59
        if('00:00' < time || time > '23:59' ){
            //send error message
            returnMessage = "The time needs to be between 00:00-23:59";
            return false;
        }

        // time have passed today, e.g today now 12:00 but insert today at 10:00
        if(date == currentDate && time < currentTime){
            returnMessage = "You have to choose a time later today";
            return returnMessage;
        }

        // everything ok
        return true;
        
    }catch(error){
        console.log(error)
    }
};

async function validate_date(message){
    try {
        var returnMessage = "";
        const jsonMessage = JSON.parse(message);
        const date = jsonMessage.date;
        const currentDate = new Date().toJSON().slice(0, 10);

        if(date<currentDate){
            returnMessage = "This date has already passed";
            return false;
        }

        //everything ok
        return true;
    }catch(error){
        console.log(error);
    }
};

async function validate_clinic(message){
    // ask - shall we retriv the info from database handler or shall I acces the db directly here? 
    return true;
}

async function validate_dentist(message){
    // same qestion as above 
    return true;
}

async function create_referance_code(){
    return Math.random().toString(36).substring(2,10)
}

async function validate_referance_code(message){
    // acces db here or via db-handler?
}

async function update_slot(message){
    // question
}

async function delete_slot(message){
    // same question as above 
}


module.exports = {
    create_new_slot, 
    validate_time, 
    validate_date,
    validate_clinic, 
    validate_dentist,

    create_referance_code,
    validate_referance_code,

    update_slot,
    delete_slot
}