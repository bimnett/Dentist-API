package com.example.dentist_app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class LoadDatabase {

    private static final Logger log = LoggerFactory.getLogger(LoadDatabase.class);

    @Bean
    CommandLineRunner initDatabase(DentistRepository repository) {

        return args -> {
            log.info("Preloading " + repository.save(new Dentist("Johnny Whitetooth")));
            log.info("Preloading " + repository.save(new Dentist("Thomas Brightsmile")));
        };
    }
}