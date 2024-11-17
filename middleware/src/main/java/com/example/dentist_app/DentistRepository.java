package com.example.dentist_app;

import org.springframework.data.jpa.repository.JpaRepository;

interface DentistRepository extends JpaRepository<Dentist, Long> {

}