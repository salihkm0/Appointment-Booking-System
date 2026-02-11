const {minutesToTime} = require('./minutesToTime');
const {timeToMinutes} = require('./timeToMinutes');

//! Helper function to generate time slots
exports.generateTimeSlots = (startTime, endTime, duration, appointments) => {
    const slots = [];
    const slotDuration = duration;
    
    //---------------- Convert time strings to minutes -----------------
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    while (currentMinutes + slotDuration <= endMinutes) {
        const slotStart = minutesToTime(currentMinutes);
        const slotEnd = minutesToTime(currentMinutes + slotDuration);
        
        //-------------------- Check if slot is available (not overlapping with existing appointments) ------------------
        const isAvailable = !appointments.some(appointment => {
            const appStart = timeToMinutes(appointment.startTime);
            const appEnd = timeToMinutes(appointment.endTime);
            
            return !(currentMinutes >= appEnd || (currentMinutes + slotDuration) <= appStart);
        });
        
        if (isAvailable) {
            slots.push({
                startTime: slotStart,
                endTime: slotEnd,
                available: true
            });
        }
        
        currentMinutes += 15;
    }
    
    return slots;
}