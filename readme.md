Appointment Booking System - README

How to Run the Project

1. Install dependencies for both frontend and backend

Backend

cd backend
npm install
npm run dev

Frontend (in new terminal)

cd frontend
npm install
npm run dev

2. Set up environment variables

Backend (.env file in backend folder):

PORT=5033
MONGODB_URI=
JWT_SECRET=
NODE_ENV=development

Frontend (.env file in frontend folder):
VITE_API_URL=http://localhost:5033/api

3. Start both servers
   npm run dev

How Booking Logic Works

Core Booking Flow

1. Provider Sets Up:
   └── Creates Services (Haircut: 30 mins, $50)
   └── Sets Availability (Mon-Fri, 9 AM - 6 PM)
   └── Blocks Dates (Holidays, Personal Days)

2. User Books Appointment:
   └── Browses available services
   └── Selects service → checks provider availability
   └── Chooses date → generates available time slots
   └── Selects time slot → validates availability
   └── Confirms booking → saves appointment

3. System Validations:
   └── No past dates allowed
   └── No double bookings
   └── Only within provider's working hours
   └── Respects service duration

Time Slot Generation Algorithm

Simplified logic:

4. Get provider's working hours for selected day
5. Check if date is blocked (holiday)
6. Get existing appointments for that day
7. Start from opening time
8. For each 15-minute interval:
   - Calculate slot start time
   - Calculate slot end time (start + service duration)
   - Check if slot overlaps with existing appointment
   - Check if slot is within working hours
   - If available, add to list
9. Return available slots to user
