module.exports = {

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
}