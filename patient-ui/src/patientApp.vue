<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg custom-navbar">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">The Dentist For You</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link" active-class="active">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/bookslot" class="nav-link" active-class="active">Book Slot</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/booking-details" class="nav-link" active-class="active">Check Booking Details</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mt-4">
      <router-view />
    </div>

    <!-- Footer -->
    <footer class="bg-light text-center py-3 mt-auto">
      <p class="mb-0">&copy; 2024 The Dentist For You. Team XX (forgot our team number)</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'PatientApp',
};
</script>

<style>
body, #app {
  background-color: #f8f9fa;
  color: #212529;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
}

.custom-navbar {
  background-color: #96b7d8; 
  color: white; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Optional shadow for depth */
}

.custom-navbar .nav-link {
  color: rgb(0, 0, 0); /* Ensure links are visible */
}

.custom-navbar .nav-link.active {
  font-weight: bold;
  border-bottom: 2px solid #2d2d2d; /* Subtle highlight for active link */
}

.nav-link {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.nav-link.active {
  font-weight: bold;
  border-bottom: 2px solid white;
}

.container {
  flex: 1;
}

footer {
  background-color: #e9ecef;
}
</style>