from locust import HttpUser, task, between, LoadTestShape, events
import random
from datetime import datetime, timedelta
import json
import string
import gevent
from locust.exception import RescheduleTask

class SharedState:
    clinics = [
        "Public Dental Service",
        "Folktandvården Sannegården",
        "Folktandvården Lundby",
        "City Tandvård"
    ]
    clinic_ids = {
        "Public Dental Service": "64a69f021234567890fedcba",
        "Folktandvården Sannegården": "64a69f021234567890fedcbb",
        "Folktandvården Lundby": "64a69f021234567890fedcbc",
        "City Tandvård": "64a69f021234567890fedcbd"
    }
    dentists = []
    available_slots = []
    MAX_SLOTS = 10000
    last_slot_creation = {}
    last_search_time = {}
    last_booking_time = {}

shared_state = SharedState()

class DentistUser(HttpUser):
    host = "http://localhost:80"
    wait_time = between(5, 10)
    connection_timeout = 30.0
    network_timeout = 30.0

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client.keep_alive = False

    def on_start(self):
        """Initialize dentists for each clinic"""
        if not shared_state.dentists:
            for clinic in shared_state.clinics:
                for _ in range(random.randint(2, 3)):
                    dentist_id = f"64a69f021234567890abcd{len(shared_state.dentists):02d}"
                    shared_state.dentists.append({
                        "id": dentist_id,
                        "clinic": clinic
                    })

    @task(3)
    def create_slots(self):
        """Create new available time slots with rate limiting and retries"""
        if not shared_state.dentists:
            return

        dentist = random.choice(shared_state.dentists)
        
        # Rate limiting per dentist
        current_time = datetime.now()
        last_creation = shared_state.last_slot_creation.get(dentist["id"])
        if last_creation and (current_time - last_creation).total_seconds() < 2:
            return

        date = (datetime.now() + timedelta(days=random.randint(1, 7))).strftime('%Y-%m-%d')
        time = f"{random.randint(9, 16)}:00 {'AM' if random.randint(9, 16) < 12 else 'PM'}"
        
        headers = {
            "Content-Type": "application/json",
            "Connection": "close"
        }

        slot_data = {
            "date": date,
            "time": time,
            "status": "Available",
            "dentist": dentist["id"],
            "clinic": shared_state.clinic_ids[dentist["clinic"]],
            "treatment": "General"
        }

        for attempt in range(3):
            try:
                with self.client.post(
                    "/api/dentists/slots/newSlots",
                    json=slot_data,
                    headers=headers,
                    catch_response=True,
                    timeout=30.0
                ) as response:
                    if response.status_code in [200, 201]:
                        shared_state.last_slot_creation[dentist["id"]] = current_time
                        if len(shared_state.available_slots) < shared_state.MAX_SLOTS:
                            shared_state.available_slots.append({
                                "date": date,
                                "time": time,
                                "dentist": dentist["id"],
                                "clinic": dentist["clinic"]
                            })
                        response.success()
                        return
                    elif response.status_code == 503:
                        if attempt < 2:
                            gevent.sleep(2 ** attempt)
                            continue
                        response.failure(f"Service unavailable after {attempt + 1} attempts")
                    else:
                        response.failure(f"Failed with status {response.status_code}")
                        return
            except Exception as e:
                if attempt == 2:
                    raise RescheduleTask()
                gevent.sleep(2 ** attempt)

    @task(1)
    def get_schedule(self):
        """Get dentist's schedule with error handling"""
        if not shared_state.dentists:
            return
            
        dentist = random.choice(shared_state.dentists)
        
        headers = {
            "Content-Type": "application/json",
            "Connection": "close"
        }

        for attempt in range(3):
            try:
                with self.client.get(
                    f"/api/dentists/schedules/{dentist['id']}", 
                    headers=headers,
                    catch_response=True,
                    timeout=20.0
                ) as response:
                    if response.status_code == 200:
                        response.success()
                        return
                    elif response.status_code == 503:
                        if attempt < 2:
                            gevent.sleep(2 ** attempt)
                            continue
                        response.failure(f"Service unavailable after {attempt + 1} attempts")
                    else:
                        response.failure(f"Failed to get schedule: {response.text}")
                        return
            except Exception as e:
                if attempt == 2:
                    raise RescheduleTask()
                gevent.sleep(2 ** attempt)

class PatientUser(HttpUser):
    host = "http://localhost:80"
    wait_time = between(5, 8)
    connection_timeout = 30.0
    network_timeout = 30.0

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client.keep_alive = False

    @task(3)
    def search_slots(self):
        """Search for available slots with rate limiting and retries"""
        clinic = random.choice(shared_state.clinics)
        current_time = datetime.now()
        
        # Rate limiting per clinic for searches
        last_search = shared_state.last_search_time.get(clinic)
        if last_search and (current_time - last_search).total_seconds() < 1:
            return

        date = (datetime.now() + timedelta(days=random.randint(1, 7))).strftime('%Y-%m-%d')
        
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Connection": "close"
        }

        for attempt in range(3):
            try:
                with self.client.get(
                    "/api/patients/available-slots",
                    params={
                        "date": date,
                        "clinic": clinic
                    },
                    headers=headers,
                    catch_response=True,
                    timeout=20.0
                ) as response:
                    if response.status_code == 200:
                        shared_state.last_search_time[clinic] = current_time
                        try:
                            data = response.json()
                            if "slots" in data:
                                new_slots = [{
                                    "date": date,
                                    "time": slot,
                                    "clinic": clinic
                                } for slot in data["slots"][:5]]
                                shared_state.available_slots.extend(new_slots)
                            response.success()
                            return
                        except json.JSONDecodeError:
                            response.failure("Invalid JSON response")
                            return
                    elif response.status_code == 503:
                        if attempt < 2:
                            gevent.sleep(2 ** attempt)
                            continue
                        response.failure(f"Service unavailable after {attempt + 1} attempts")
                    else:
                        response.failure(f"Error searching slots: {response.text}")
                        return
            except Exception as e:
                if attempt == 2:
                    raise RescheduleTask()
                gevent.sleep(2 ** attempt)

    @task(1)
    def book_slot(self):
        """Book an available slot with rate limiting and retries"""
        if not shared_state.available_slots:
            return

        current_time = datetime.now()
        try:
            slot = random.choice(shared_state.available_slots)
            shared_state.available_slots.remove(slot)
        except (IndexError, ValueError):
            return

        # Rate limiting per clinic for bookings
        last_booking = shared_state.last_booking_time.get(slot["clinic"])
        if last_booking and (current_time - last_booking).total_seconds() < 2:
            return

        booking_data = {
            "name": f"Test Patient {random.randint(1000, 9999)}",
            "email": f"patient{random.randint(1000, 9999)}@example.com",
            "phone": f"07{random.randint(10,99)}{random.randint(100000,999999)}",
            "treatment": "General",
            "date": slot["date"],
            "time": slot["time"],
            "clinic": slot["clinic"]
        }

        headers = {
            "Content-Type": "application/json",
            "Connection": "close"
        }

        for attempt in range(3):
            try:
                with self.client.post(
                    f"/api/patients/dentists/{slot.get('dentist', random.choice(shared_state.dentists)['id'])}/bookings",
                    json=booking_data,
                    headers=headers,
                    catch_response=True,
                    timeout=30.0
                ) as response:
                    if response.status_code == 201:
                        shared_state.last_booking_time[slot["clinic"]] = current_time
                        response.success()
                        return
                    elif response.status_code == 503:
                        if attempt < 2:
                            gevent.sleep(2 ** attempt)
                            continue
                        response.failure(f"Service unavailable after {attempt + 1} attempts")
                    else:
                        response.failure(f"Booking failed: {response.text}")
                        return
            except Exception as e:
                if attempt == 2:
                    raise RescheduleTask()
                gevent.sleep(2 ** attempt)

class StaggeredLoadShape(LoadTestShape):
    stages = [
        {"duration": 20, "users": (25, 3), "spawn_rate": (1, 1)},     # Start very gentle
        {"duration": 20, "users": (100, 5), "spawn_rate": (2, 1)},    # Gradual increase
        {"duration": 20, "users": (250, 10), "spawn_rate": (3, 1)},   # Medium load
        {"duration": 20, "users": (350, 5), "spawn_rate": (2, 1)},    # Peak load
        {"duration": 20, "users": (300, 3), "spawn_rate": (1, 1)},     # Cool down
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
    shared_state.dentists = []
    shared_state.available_slots = []
    shared_state.last_slot_creation = {}
    shared_state.last_search_time = {}
    shared_state.last_booking_time = {}

@events.reset_stats.add_listener
def on_reset_stats(**kwargs):
    """Clear only the available slots when stats are reset"""
    shared_state.available_slots = []