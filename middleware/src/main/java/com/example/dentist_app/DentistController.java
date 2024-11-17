package com.example.dentist_app;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class DentistController {

    private final DentistRepository repository;

    DentistController(DentistRepository repository) {
        this.repository = repository;
    }


    // Aggregate root
    // tag::get-aggregate-root[]
    @GetMapping("/dentists")
    List<Dentist> all() {
        return repository.findAll();
    }
    // end::get-aggregate-root[]

    @PostMapping("/dentists")
    Dentist newDentist(@RequestBody Dentist newDentist) {
        return repository.save(newDentist);
    }

    // Single item

    @GetMapping("/dentists/{id}")
    Dentist one(@PathVariable Long id) {

        return repository.findById(id)
                .orElseThrow(() -> new DentistNotFoundException(id));
    }

    @PutMapping("/dentists/{id}")
    Dentist replaceDentist(@RequestBody Dentist newDentist, @PathVariable Long id) {

        return repository.findById(id)
                .map(employee -> {
                    employee.setName(newDentist.getName());
                    return repository.save(employee);
                })
                .orElseGet(() -> {
                    return repository.save(newDentist);
                });
    }

    @DeleteMapping("/dentists/{id}")
    void deleteDentist(@PathVariable Long id) {
        repository.deleteById(id);
    }
}