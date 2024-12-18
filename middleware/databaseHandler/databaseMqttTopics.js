module.exports = {

    // database topics
    clinic: 'database/slot/retrieve/clinic',
    dentist_in_clinic: 'database/slot/retrieve/dentist/from/clinic',
    reference_codes: 'database/slot/retrieve/reference/code',
    retrieved_specific_clinic: 'database/slot/found/special/clinic',
    retrieved_specific_dentist: 'database/slot/found/special/dentist',
    dentist_schedule: 'database/schedule/all/slots/for/special/dentist',
    cached_schedule: 'database/schedule/all/slots',

    // for logs (logs sub)
    logs: 'servers/database/insert/logs',
    log_data: 'database/monitoring/log/data',

    // slot publish topics
    new_slot_data: 'slot/database/insert/new/slot',
    updated_slot_data: 'slot/database/insert/updates/to/slot',
    deletion_of_slot: 'slot/database/delete/an/existing/slot',

    // Timeslot availability topics
    database_request_find: 'database/request/timeslot/find',
    database_request_update: 'database/request/timeslot/update',
    database_response_timeslot: 'database/response/timeslot',

    // Dentist availability
    database_request_dentists: 'database/request/dentists/available',
    database_response_dentists: 'database/response/dentists/available',

    // Available timeslots
    database_request_slots: 'database/request/slots/available',
    database_response_slots: 'database/response/slots/available',

    // Slot reservation
    database_request_reserve: 'database/request/reserve',
    database_response_reserve: 'database/response/reserve',

    // Slot booking
    database_request_book_slot: 'database/request/book/slot',
    database_response_book_slot: 'database/response/book/slot',

    // Booking reference code
    database_request_reference_code: 'database/request/reference-code',
    database_response_reference_code: 'database/response/reference-code',

    // Deleting booking
    database_request_delete_reference_code: 'database/request/delete/reference-code',
    database_response_delete_reference_code: 'database/response/delete/reference-code',

    // Reset expired reservations
    database_request_check_expired_reservations: 'database/request/check/expired/reservations',
    database_response_check_expired_reservations: 'database/response/check/expired/reservations',

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
    dentist_id: 'dentist/database/send/dentist/id',
    cached_dentist_id: 'dentist/schedule/send/dentist/id/cached',

    // schedule service
    cached_dentist_schedule: 'schedule/dentist/send/dentist/schedule/cached',




};