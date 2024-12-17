from locust import HttpUser, task, between, LoadTestShape, events
import random
from datetime import datetime, timedelta
import string

def generate_phone():
    """Generate a random Swedish-format phone number"""
    return f"07{random.randint(10,99)}{random.randint(100000,999999)}"

def generate_email():
    """Generate a random email address"""
    name = ''.join(random.choices(string.ascii_lowercase, k=8))
    return f"{name}@example.com"

def generate_time():
    """Generate a time in HH:MM AM/PM format"""
    hour = random.randint(9, 16)  # 9 AM to 4 PM
    period = "AM" if hour < 12 else "PM"
    if hour > 12:
        hour -= 12
    return f"{hour}:00 {period}"

class SharedState:
    clinics = []  # List of clinic IDs
    dentists = []  # List of dentist IDs
    available_slots = []  # List of available slots with their details
    MAX_SLOTS = 10000

shared_state = SharedState()

# ---- Dentist User Class ----
class DentistUser(HttpUser):
    host = "http://localhost:80"  # Dentist server port
    wait_time = between(2, 5)

    def on_start(self):
        """Initialize with some test clinics and dentists"""
        if not shared_state.clinics:
            # Add some test clinic IDs
            for i in range(5):
                clinic_id = f"64a69f021234567890fedc{i:02d}"
                shared_state.clinics.append(clinic_id)
                
                # Create 2-3 dentists per clinic
                for j in range(random.randint(2, 3)):
                    dentist_id = f"64a69f021234567890abcd{len(shared_state.dentists):02d}"
                    shared_state.dentists.append({
                        "id": dentist_id,
                        "clinic": clinic_id
                    })

    @task(3)
    def create_slots(self):
        """Create new available time slots"""
        if not shared_state.dentists:
            return

        dentist = random.choice(shared_state.dentists)
        date = (datetime.now() + timedelta(days=random.randint(1, 14))).strftime('%Y-%m-%d')
        time = generate_time()
        
        slot_data = {
            "date": date,
            "time": time,
            "status": "Available",
            "dentist": dentist["id"],
            "clinic": dentist["clinic"],
            "treatment": "General"
        }

        # Store slot info for booking
        if len(shared_state.available_slots) < shared_state.MAX_SLOTS:
            shared_state.available_slots.append({
                "date": date,
                "time": time,
                "dentist": dentist["id"],
                "clinic": dentist["clinic"]
            })

        self.client.post("/api/dentist/slots/newSlots", json=slot_data)

    @task(1)
    def get_schedule(self):
        """Get dentist's schedule"""
        if not shared_state.dentists:
            return
            
        dentist = random.choice(shared_state.dentists)
        self.client.get(f"/api/dentist/schedules/{dentist['id']}", 
                       json={"dentist": dentist["id"]})

# ---- Patient User Class ----
class PatientUser(HttpUser):
    host = "http://localhost:80"  # Patient server port
    wait_time = between(1, 3)

    @task(3)
    def search_slots(self):
        """Search for available slots"""
        if not shared_state.clinics:
            return
            
        clinic = random.choice(shared_state.clinics)
        date = (datetime.now() + timedelta(days=random.randint(1, 14))).strftime('%Y-%m-%d')
        
        self.client.get("/api/patient/available-slots", 
                       params={"date": date, "clinic": clinic})

    @task(1)
    def book_slot(self):
        """Book an available slot"""
        if not shared_state.available_slots:
            return

        slot = random.choice(shared_state.available_slots)
        try:
            shared_state.available_slots.remove(slot)
        except ValueError:
            return

        booking_data = {
            "name": f"Patient {random.randint(1000, 9999)}",
            "email": generate_email(),
            "phone": generate_phone(),
            "treatment": "General",
            "date": slot["date"],
            "time": slot["time"],
            "clinic": slot["clinic"]
        }

        self.client.post(f"/api/patient/dentists/{slot['dentist']}/bookings", 
                        json=booking_data)

# ---- Custom Load Shape ----
class StressTestShape(LoadTestShape):
    stages = [
        # Initial slot creation phase
        {"duration": 60, "users": (0, 20), "spawn_rate": (0, 5)},  # (patients, dentists)
        
        # Start patient bookings while maintaining slot creation
        {"duration": 120, "users": (500, 20), "spawn_rate": (50, 5)},
        
        # Peak load
        {"duration": 300, "users": (2000, 30), "spawn_rate": (100, 5)},
        
        # Gradual drop-off
        {"duration": 120, "users": (500, 10), "spawn_rate": (50, 2)},
    ]

    def tick(self):
        run_time = self.get_run_time()
        
        for stage in self.stages:
            if run_time < stage["duration"]:
                patient_users, dentist_users = stage["users"]
                patient_spawn, dentist_spawn = stage["spawn_rate"]
                return (patient_users + dentist_users, 
                       patient_spawn + dentist_spawn)
            run_time -= stage["duration"]
        
        return None

@events.test_start.add_listener
def on_test_start(**kwargs):
    """Initialize the shared state at test start"""
    shared_state.clinics = []
    shared_state.dentists = []
    shared_state.available_slots = []

@events.reset_stats.add_listener
def on_reset_stats(**kwargs):
    """Clear only the available slots when stats are reset"""
    shared_state.available_slots = []