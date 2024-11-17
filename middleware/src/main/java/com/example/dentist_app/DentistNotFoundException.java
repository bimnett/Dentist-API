package com.example.dentist_app;

class DentistNotFoundException extends RuntimeException {

    DentistNotFoundException(Long id) {
        super("Could not find dentist " + id);
    }
}