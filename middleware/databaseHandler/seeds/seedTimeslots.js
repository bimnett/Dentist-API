const mongoose = require('mongoose');
const CREDENTIAL = require('../credentials');
const Timeslot = require('../models/timeslot');

// Connect to MongoDB
mongoose.connect(CREDENTIAL.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

async function seedTimeslots() {
    const timeslots = [
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f11111"), // Timeslot ID
            date: "2024-12-01",
            time: "10:00 AM",
            status: "Booked",
            patient: { name: "Alice Johnson", email: "alice.johnson@example.com", phone: "123-456-7890" },
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcdef"), // Hardcoded ID for John Johnson
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcba"), // Hardcoded ID for Public Dental Service
            treatment: "Tooth Extraction",
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f22222"),
            date: "2024-12-02",
            time: "2:30 PM",
            status: "Booked",
            patient: { name: "Bob Smith", email: "bob.smith@example.com", phone: "987-654-3210" },
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcdea"), // Hardcoded ID for Michael Mike
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbb"), // Hardcoded ID for Folktandvården Sannegården
            treatment: "Teeth Cleaning",
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f33333"),
            date: "2024-12-01",
            time: "11:30 AM",
            status: "Booked",
            patient: { name: "Charlie Brown", email: "charlie.brown@example.com", phone: "555-123-4567" },
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcded"), // Hardcoded ID for Sarah Sarah
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbc"), // Hardcoded ID for Folktandvården Lundby
            treatment: "General",
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f44444"),
            date: "2024-12-03",
            time: "9:30 AM",
            status: "Booked",
            patient: { name: "Daisy Ridley", email: "daisy.ridley@example.com", phone: "222-333-4444" },
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcdef"), // Hardcoded ID for John Johnson
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcba"), // Hardcoded ID for City Tandvård
            treatment: "Laminated Tooth Veneer",
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f66666"),
            date: "2024-12-02",
            time: "11:00 AM",
            status: "Available",
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcdea"), // Michael Mike
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbb"), // Folktandvården Sannegården
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f77777"),
            date: "2024-12-02",
            time: "3:00 PM",
            status: "Available",
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcdea"), // Michael Mike
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbb"), // Folktandvården Sannegården
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f88888"),
            date: "2024-12-03",
            time: "10:00 AM",
            status: "Available",
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcded"), // Sarah Sarah
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbc"), // Folktandvården Lundby
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890f99999"),
            date: "2024-12-03",
            time: "4:00 PM",
            status: "Available",
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcdef"), // John Johnson
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcba"), // City Tandvård
        },
        {
            _id: new mongoose.Types.ObjectId("64a69f021234567890faa000"),
            date: "2024-12-03",
            time: "5:00 PM",
            status: "Available",
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcded"), // Sarah Sarah
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbc"), // Folktandvården Lundby
        },
        //notification testing booking
        {
            _id: ObjectId('675dd761cb4060f79d4b447c'),
            status: "Booked",
            date: "2024-12-03",
            time: "5:00 PM",
            dentist: new mongoose.Types.ObjectId("64a69f021234567890abcded"), // Sarah Sarah
            clinic: new mongoose.Types.ObjectId("64a69f021234567890fedcbc"), // Folktandvården Lundby
            patient: {name: "Cancel Test", email: CREDENTIAL.email}
        }
    ];

    Timeslot.insertMany(timeslots)
        .then(() => {
            console.log('Timeslots inserted successfully');
            mongoose.connection.close();
        })
        .catch((err) => console.error('Error inserting timeslots:', err));
}

seedTimeslots();