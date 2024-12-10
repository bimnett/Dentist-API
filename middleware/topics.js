module.exports = {
        // test topic
        test:'topic/test',
        hello:'topic/hello',

        // ---------------

        // database topics
        clinic: 'database/slot/retrieve/clinic',
        dentist_in_clinic: 'database/slot/retrieve/dentist/from/clinic',
        reference_codes: 'database/slot/retrieve/reference/code',
        retrieved_specific_clinic: 'database/slot/found/special/clinic',
        retrieved_specific_dentist: 'database/slot/found/special/dentist',
        dentist_schedule: 'database/schedule/all/slots/for/special/dentist',


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