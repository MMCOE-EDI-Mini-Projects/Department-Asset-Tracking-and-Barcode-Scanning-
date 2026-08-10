# Traffic Junction Logic Controller

A software-based traffic management system that simulates a multi-lane road junction using finite state machines, adaptive timing algorithms, and event-driven programming. The project demonstrates concepts from Object-Oriented Programming, Data Structures, Database Management Systems, Software Engineering, Web Technologies, and Principles of Programming Languages.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Modules](#modules)
- [System Workflow](#system-workflow)
- [Traffic Signal States](#traffic-signal-states)
- [Event Types](#event-types)
- [Database Schema](#database-schema)
- [Repository Structure](#repository-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Future Enhancements](#future-enhancements)
- [Team Allocation](#team-allocation)
- [License](#license)

---

## Overview

The **Traffic Junction Logic Controller** is designed to simulate the functioning of a modern traffic intersection. It coordinates multiple traffic signals while ensuring safe vehicle movement, adaptive signal timing, emergency vehicle prioritization, and real-time visualization.

The project follows a modular software engineering approach, making every subsystem independently maintainable and scalable.

## Problem Statement

Develop a software system capable of managing a traffic junction with multiple lanes. The controller should:

- Manage signal transitions using Finite State Machines (FSM)
- Prevent conflicting traffic movements
- Adapt signal timing according to traffic density
- Handle emergency vehicle requests
- Simulate junction behavior
- Store historical data
- Provide a web dashboard for monitoring

## Objectives

- Implement Finite State Machines
- Build adaptive timing logic
- Handle real-time events
- Simulate traffic flow
- Visualize junction activity
- Store logs in a relational database
- Develop REST APIs
- Apply software engineering best practices

## Features

- Multi-lane junction simulation
- Adaptive traffic signals
- Vehicle queue simulation
- Emergency vehicle override
- Event-driven architecture
- Live visualization
- Historical logging
- Database support
- REST API
- Modular architecture

## Technology Stack

**Programming Languages**
- Java
- JavaScript
- SQL

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Java

**Database**
- MySQL

**Version Control**
- Git
- GitHub

## Project Architecture

```
Sensor / Input
      │
      ▼
Event Handler
      │
      ▼
State Machine
      │
      ▼
Timing Logic
      │
      ▼
Simulation Engine
     ╱      ╲
    ▼        ▼
Database  Dashboard
```

## Modules

### Sensor / Input Module
Responsible for:
- Vehicle detection
- Vehicle count simulation
- Emergency vehicle detection

### State Machine Controller
Implements the traffic signal FSM.

**States:**
- RED
- GREEN
- YELLOW
- EMERGENCY

### Timing Logic Module
Handles:
- Signal timers
- Adaptive green duration
- Yellow interval
- Scheduling

### Event Handling Module
Processes:
- Timer events
- Vehicle events
- Emergency events
- System events

### Simulation & Visualization Module
Provides:
- Live traffic animation
- Queue visualization
- Countdown timers
- Simulation controls

### Database & Logging Module
Stores:
- Junction configuration
- Traffic signals
- Vehicle logs
- Event history

### Web Dashboard / API
Provides:
- Live monitoring
- REST APIs
- Historical analytics

### Testing & Validation
Includes:
- Unit testing
- Integration testing
- State validation
- Timing verification

## System Workflow

```
 Vehicle Sensors
       │
       ▼
  Event Handler
       │
       ▼
  State Machine
       │
       ▼
  Timing Logic
       │
       ▼
 Simulation Engine
     ╱        ╲
    ▼          ▼
Dashboard   Database
```

## Traffic Signal States

| State | Description |
|---|---|
| 🔴 RED | Stop |
| 🟡 YELLOW | Prepare to Stop |
| 🟢 GREEN | Go |
| 🚑 EMERGENCY | Priority Lane |

## Event Types

- Vehicle Arrival
- Vehicle Departure
- Timer Expiry
- Emergency Vehicle Detection
- Manual Override
- Simulation Start
- Simulation Stop

## Database Schema

**Junction**
- Junction ID
- Name
- Number of Lanes

**Signals**
- Signal ID
- Current State
- Remaining Timer

**Vehicles**
- Vehicle ID
- Lane
- Entry Time
- Exit Time

**Event Logs**
- Event ID
- Event Type
- Timestamp

## Repository Structure

```
Traffic-Junction-Logic-Controller/
├── backend/
├── frontend/
├── database/
├── docs/
├── tests/
├── screenshots/
├── README.md
└── LICENSE
```

## Installation

```bash
git clone https://github.com/yourusername/Traffic-Junction-Logic-Controller.git
cd Traffic-Junction-Logic-Controller
```

## Usage

1. Start the backend.
2. Configure the database.
3. Launch the simulation.
4. Open the dashboard.
5. Monitor traffic signals in real time.

## Future Enhancements

- AI-based traffic prediction
- IoT traffic sensors
- Computer vision vehicle detection
- Multiple interconnected junctions
- Mobile application
- Smart city integration

## Team Allocation

| Module | Team Members |
|---|---|
| Sensor/Input Module<br>Testing & Validation Module | Mayur Kolhe<br>Sai Patil<br>Viraj Joglekar |
| Simulation & Visualization Module<br>Event Handling Module | Vedant Pathak<br>Arya Joshi<br>Pranjal Khairnar |
| State Machine (Controller) Module<br>Timing Logic Module | Siddiqa Bagwan<br>Swayamprabha Badade<br>Shreya Rathod |
| Database & Logging Module<br>Web Dashboard / API Module | Yash Bhure<br>Uday Pawade<br>Tanishka Wagh<br>Sanskruti Ghavghave |

## License

This project is developed as part of the Engineering Design & Innovation Mini Project for academic purposes.
