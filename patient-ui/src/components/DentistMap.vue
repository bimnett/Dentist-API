<template>
  <div id="map"></div>
</template>

<script>
  import patientApi from '../patientApi'

  export default {
    name: "DentistMap",
    data() {
        return {
            dentistClinics: [
              { lat: 57.69956, long: 11.94658, name: "Public Dental Service", address: "Första Långgatan 26, 413 28 Göteborg" },
              { lat: 57.70891, long: 11.92699, name: "Folktandvården Sannegården", address: "Vintergatan 1A, 417 58 Göteborg" },
              { lat: 57.7215, long: 11.93631, name: "Folktandvården Lundby", address: "Wieselgrensplatsen 6, 417 39 Göteborg" },
              { lat: 57.70345, long: 11.93789, name: "City Tandvård", address: "Södra Vägen 27, 411 35 Göteborg" }
            ]
        }
    },
    async mounted() {

      // Fetch dentist clinics
      //this.dentistClinics = await patientApi.getDentistClinics();

      // Initialize the map
      const map = L.map("map").setView([57.7089, 11.9746], 12);
  
      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Place a marker on the map for each clinic
      this.dentistClinics.forEach(clinic => {
        L.marker([clinic.lat, clinic.long])
          .addTo(map)
          .bindPopup(`${clinic.name}<br>${clinic.address}`);
      });
    },
  };
</script>

<style>
#map {
  height: 70%;
  width: 100%;
}
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>