from locust import HttpUser, task, between, LoadTestShape
import random

# ---- Dentist User Class ----
class DentistUser(HttpUser):
    host = "http://localhost:3000"  # Host for dentists' server
    wait_time = between(5, 10)  # Simulate periodic activity every 5-10 seconds

    @task
    def send_appointments(self):
        """Simulate a clinic sending appointment data to the system."""
        appointment_data = {
            "dentist_id": random.randint(1, 1000),  # Simulate up to 1000 dentists
            "appointments": [{"patient_id": random.randint(1, 10000), "time": "2024-12-01T10:00:00"}]
        }
        self.client.post("/api/appointments", json=appointment_data)

    @task
    def receive_appointments(self):
        """Simulate a clinic fetching its appointments."""
        clinic_id = random.randint(1, 1000)
        self.client.get(f"/api/appointments?clinic_id={clinic_id}")


# ---- Patient User Class ----
class PatientUser(HttpUser):
    host = "http://localhost:3001"  # Host for patients' server
    wait_time = between(1, 3)  # Simulate frequent patient activity

    @task(3)
    def search_slots(self):
        """Simulate a patient searching for available slots."""
        self.client.get("/api/slots/search", params={
            "date": "2024-12-01",
            "clinic_id": random.randint(1, 1000)
        })

    @task(1)
    def book_slot(self):
        """Simulate a patient booking a slot."""
        slot_data = {
            "patient_id": random.randint(1, 10000),
            "clinic_id": random.randint(1, 1000),
            "time": "2024-12-01T10:00:00"
        }
        self.client.post("/api/slots/book", json=slot_data)


# ---- Custom Load Shape ----
class LaunchDayLoad(LoadTestShape):
    """
    Custom load shape to simulate significant traffic spikes during launch day.
    Gradually ramps up users, then holds a peak, and drops off.
    """

    stages = [
        {"duration": 60, "users": 1000, "spawn_rate": 100},  # Ramp up to 1000 users in 1 minute
        {"duration": 300, "users": 5000, "spawn_rate": 200}, # Peak: 5000 users for 5 minutes
        {"duration": 120, "users": 2000, "spawn_rate": 50},  # Gradual drop-off
        {"duration": 60, "users": 0, "spawn_rate": 50},      # Cool down
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                tick_data = (stage["users"], stage["spawn_rate"])
                return tick_data
            run_time -= stage["duration"]
        return None
