module.exports = {
        // test topic
        test:'topic/test',
        hello:'topic/hello',
    
        /*
        // Database topics
        database_insert: 'database/insert',
        database_retrieve: 'database/retrieve',
    
        database_retrive_clinic: 'database/retrive/clinic',
        database_retrive_dentist: 'database/retrive/clinic/dentists',
        database_retrive_reference_code:'database/retrive/referance/code',

        database_update: 'database/update',
        database_insert_response: 'database/response/insert',
        database_retrieve_response: 'database/response/retrieve',
        database_update_response: 'database/response/update',
    
        // patient-related topics
        notification_patient: 'notifications/patient',
        notification_dentist: 'notifications/dentist',
        slot_management_update: 'slot/update',
        slot_management_delete: 'slot/delete',
    
        // booking and appointment related topics
        booked_appointment_info: 'bookedappointment/appointment/info',
        appointment_book: 'appointment/book',
        appointment_cancel: 'appointment/cancel',
    
        // slot management related topics
        slot_management_create: 'slots/createSlot',
    
        slot_management_created: 'slot/database/insert/new/created/slot',
    
        slot_dentist_avaliable: 'slots/dentist/avaliableSlots',
        dentist_new_slots: 'slots/dentist/newslots',
        clinic_dentist_slots: 'slots/clinic/dentist/avaliableSlots',
    
        slot_management_update: 'slot/update',
        slot_managemnt_updated: 'slot/database/update/slot',
    
        slot_management_delete: 'slot/delete',
        slot_management_deleted: 'slot/database/delte/slot',
        
        // clinics and dentists related topics
        //all_clinics: 'clinics',
        clinic_dentists: 'clinic/dentists',
        appointments_dentist: 'appointments/dentist/bookedAppointments',
        appointment_info: 'appointments/appointment/reference/info',
        */

        // ---------------

        // database topics
        clinic: 'database/slot/retrieve/clinic',
        dentist_in_clinic: 'database/slot/retrieve/dentist/from/clinic',
        reference_codes: 'database/slot/retrieve/reference/code',
        retrieved_specific_clinic: 'database/slot/found/special/clinic',
        retrieved_specific_dentist: 'database/slot/found/special/dentist',


        // slot publish topics
        new_slot_data: 'slot/database/insert/new/slot',
        updated_slot_data: 'slot/database/insert/updates/to/slot',
        deletion_of_slot: 'slot/database/delete/an/existing/slot',

        // used?
        validated_update_slot: 'slot/database/updated/slot',
        validated_delete_slot: 'slot/database/delete/slot',

        //used?
        specific_clinic: 'slot/database/find/special/clinic',
        specific_dentist: 'slot/database/find/special/dentist',
        specific_reference_code: 'lot/database/find/special/reference/code',

        // dentist server publish 
        create_new_slot: 'dentist/slot/create/new/slot',
        update_slot: 'dentist/slot/update/slot',
        delete_slot: 'dentist/slot/delete/slot',

        // all topics
        everything: '#'


        /*QUESTIONS 
            - acces the db directly here or througth the db-handler?
            - ok to update the db-hnadler? so it maches to what happens here?
            - ok to update the topics?
            - referance code - shall I create it or shall we use mongoDb:s one
        */


    

};