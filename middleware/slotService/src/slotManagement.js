

// dentist creats new avaliable time slot
async function create_new_slot(topic,message){
    // when reciving info about the new slot
    try{
        // validate the input 
        var [time, date, clinic, dentist] = await Promise.all([
            validate_time(message),
            validate_date(message),
            validate_clinic(message),
            validate_dentist(message)
        ]);
        console.log(time,date,clinic,dentist); 

        // info given is ok --> cretae new slot 
        if(time && date && clinic && dentist){
            // DO PUB TO DB??????
            // only need to forward the info with pub to db with the rigth topic 
            console.log("create slot for this date: "+ date);
            console.log("the slot has been created succesfully");
        } else {
            console.log("Can't create slot\n");
        }

    } catch (error){
        console.log(error);
    }
    
};

async function validate_time(message){
    try {
        const jsonMessage = JSON.parse(message);
        const date = jsonMessage.date;
        const time = jsonMessage.time;
        const messageHour = time.slice(0,2);
        const messageMinutes = time.slice(3,5);
        
        const currentDate = new Date().toJSON().slice(0, 10);
        const currentHour = new Date().toJSON().slice(11,13);
        const currentMinutes = new Date().toJSON().slice(14,16);
        
        // Number --> to compare to numbers instead of strings 
        // valid time: hour 0-23, min 00:59
        if(Number(messageHour)<Number(0) || Number(messageHour)>Number(23) || Number(messageMinutes)<Number(0) || Number(messageMinutes)>Number(59)){
            return false;
        }

        // booke the same day
        if(date == currentDate){
            // time have passed today, e.g today now 12:00 but want to insert today at 10:00
            if( Number(messageHour) < Number(currentHour) ){
                return false;
            }
            // now 15:34 but want to book 15:10
            if( Number(messageMinutes) < Number(currentMinutes) ){
                return false;
            }
            // now 12:15 but want to book 18:00
            return true;
        }

        // everything ok
        return true;
        
    }catch(error){
        console.log(error)
    }
};

async function validate_date(message){
    try {
        const jsonMessage = JSON.parse(message);
        const date = jsonMessage.date;
        const currentDate = new Date().toJSON().slice(0, 10);

        // date has paased
        if(date<currentDate){
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
    // NEEDED?
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