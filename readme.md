# Appointment Booking System

A full-stack Appointment Booking System built with **MERN stack** that allows service providers to manage availability and users to book appointments efficiently.

---

## Tech Stack

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **Database:** MongoDB  
- **Authentication:** JWT  

---

## Set Up Environment Variables

#### Backend

PORT=5033
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

#### Frontend

VITE_API_URL=http://localhost:5033/api

## How to Run the Project

#### Backend

cd backend
npm install
npm run dev

#### Frontend

cd frontend
npm install
npm run dev


## How Booking Logic Works

### Core Booking Flow

#### 1. Provider Setup

Creates services (e.g., Haircut - 30 mins - ₹50)
Sets availability (Monday to Friday, 9 AM - 6 PM)
Blocks dates (Holidays, Personal Leave)

#### 2. User Books Appointment

Browses available services
Selects service → system checks provider availability
Selects date → generates available time slots
Selects time slot → validates availability
Confirms booking → appointment saved

#### 3. System Validations

Prevents past date bookings
Avoids double booking
Enforces provider working hours
Respects service duration


### Time Slot Generation Algorithm

#### Simplified Logic Flow

Get provider working hours for selected day
Check if selected date is blocked
Fetch existing appointments for that day
Start from opening time
Loop through every 15-minute interval

For each slot:
Calculate slot start time
Calculate slot end time (start + service duration)
Check overlap with existing appointments
Check within working hours
If valid → add to available slots
Return all available slots to user