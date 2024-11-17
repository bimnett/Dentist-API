package com.example.dentist_app;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;


@Entity
class Dentist {

    private @Id @GeneratedValue Long id;
    private String name;

    Dentist() {}

    Dentist(String name) {
        this.name = name;
    }

    public Long getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Dentist))
            return false;
        Dentist dentist = (Dentist) o;
        return Objects.equals(this.id, dentist.id) && Objects.equals(this.name, dentist.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id, this.name);
    }

    @Override
    public String toString() {
        return "Dentist{" + "id=" + this.id + ", name='" + this.name + '\'' + '}';
    }
}