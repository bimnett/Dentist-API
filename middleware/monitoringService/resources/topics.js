module.exports = {
    //DB receiving topics:
    log_data: 'monitoring/send/logs/data',

    //Endpoints log topics
    monitored_topics: [
        'database/slot/retrieve/clinic',
        'database/slot/retrieve/dentist/from/clinic',
        'database/slot/retrieve/reference/code',
        'database/slot/found/special/clinic',
        'database/slot/found/special/dentist',
        'database/request/dentists/available',
        'database/request/slots/available',
        'database/request/reserve',
        'database/request/book/slot',
        'database/request/reference-code',
        'database/request/delete/reference-code',
    ],
    //DB save log data
    log_save: 'database/log/save',

    log_request: 'database/log/request',
}