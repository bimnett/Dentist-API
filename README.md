# Swedish Dental Appointment Booking System

A distributed system that enables residents across Sweden to easily find and book dental appointments through a web-based interface. The system connects patients with dental clinics while providing real-time updates on appointment availability.

## Features

- **Interactive Map Interface**
  - Navigate through an interactive map of dental clinics
  - Real-time visualization of appointment availability
  - Responsive design for mobile, tablet, and desktop devices

- **Appointment Management**
  - Search and book available time slots
  - Receive instant booking confirmations
  - Cancel existing appointments
  - Get notifications for new slot availability or cancellations

- **Clinic Integration**
  - API for dental clinics to integrate with their existing systems
  - Real-time slot management and booking notifications
  - Admin dashboard for system monitoring
  - Command-line tool for testing and demonstration

## System Architecture

The system is built on a distributed architecture with the following core components:

1. **Web Frontend**
   - Responsive web application
   - Interactive map interface
   - Real-time updates using MQTT

2. **Middleware Layer**
   - MQTT-based message broker for real-time communication
   - RESTful API for clinic integration
   - Persistent storage with failover capability
   - Load balancing for high availability

3. **Database Layer**
   - Persistent storage of appointments and clinic data
   - 96-hour cached data for fault tolerance
   - Redundant storage for critical data

4. **Monitoring Tools**
   - System stress monitoring
   - Performance metrics dashboard
   - Load testing utilities

## Technical Stack

- Frontend: Vue.js
- Middleware: NodeJS, Docker
- Message Broker: Eclipse Mosquitto
- Database: MongoDB
- Load Balancer: Nginx

## Development

We follow a structured development process with:
- GitLab for version control and issue tracking
- Pull request-based workflow
- Automated testing for middleware components
- Regular code reviews

## Acknowledgments

- Special thanks to all contributors and testers