const Availability = require("../../models/Availability");
const Service = require("../../models/Service");
const Appointment = require("../../models/Appointment");
const { generateTimeSlots } = require("../../helpers/generateTimeSlots");

//! Get Available Time Slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { providerId, serviceId, date } = req.query;

    console.log("📅 Getting slots for:", { providerId, serviceId, date });

    //------------------ Validate required parameters -----------------
    if (!providerId || !serviceId || !date) {
      return res.status(400).json({
        error: "Missing required parameters",
        required: ["providerId", "serviceId", "date"],
      });
    }

    //---------------- Convert date string to Date object -------------------
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const now = new Date();

    console.log("📅 Day of week:", dayOfWeek);
    console.log("⏰ Current time:", now);

    //------------------ Check if the requested date is in the past --------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      console.log("❌ Requested date is in the past");
      return res.json([]);
    }
 
    //------------ Get provider's availability for this day -----------------
    const availability = await Availability.findOne({
      provider: providerId,
      dayOfWeek,
    });

    console.log("📅 Availability found:", availability);

    if (!availability || availability.isBlocked) {
      console.log("❌ No availability or blocked");
      return res.json([]);
    }

    //------------- Check if date is blocked ----------------
    const isBlocked = await Availability.findOne({
      provider: providerId,
      dayOfWeek: -1,
      blockedDate: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
    });

    if (isBlocked) {
      console.log("❌ Date is blocked");
      return res.json([]);
    }

    //------------ Get service duration ----------------
    const service = await Service.findById(serviceId);
    console.log("🔧 Service found:", service);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    //-------------- Get existing appointments for this date ----------------
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      provider: providerId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      status: "booked",
    }).sort("startTime");

    console.log("📅 Existing appointments:", appointments.length);

    //------------- Generate time slots ----------------
    let slots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      service.duration,
      appointments,
    );

    console.log("⏰ Generated slots before filtering:", slots.length);

    //-------------------  Filter out past time slots for today ----------------------
    if (isToday(selectedDate)) {
      const currentTime = getCurrentTime();
      console.log("⏰ Filtering slots for today. Current time:", currentTime);

      slots = slots.filter((slot) => {
        const slotTime = slot.startTime;
        const isFutureSlot = isTimeInFuture(slotTime, currentTime);
        console.log(
          `   Slot ${slotTime}: ${isFutureSlot ? "Future ✓" : "Past ✗"}`,
        );
        return isFutureSlot;
      });
    }

    console.log("⏰ Final slots after filtering:", slots.length);

    res.json(slots);
  } catch (error) {
    console.error("❌ Error in getAvailableSlots:", error);
    res.status(500).json({ error: error.message });
  }
};

//! Helper function to check if date is today
function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

//! Helper function to get current time in HH:MM format
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

//! Helper function to check if a time slot is in the future
function isTimeInFuture(slotTime, currentTime) {
  const [slotHours, slotMinutes] = slotTime.split(":").map(Number);
  const [currentHours, currentMinutes] = currentTime.split(":").map(Number);

  return (
    slotHours > currentHours ||
    (slotHours === currentHours && slotMinutes > currentMinutes)
  );
}
