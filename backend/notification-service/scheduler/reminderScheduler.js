//this file checks every minute if any reminder is due and logs it to the console
exports.startScheduler = (reminders) => {
  const cron = require("node-cron");

  cron.schedule("* * * * *", () => {    // Runs every minute
    const now = new Date().toLocaleTimeString([], { // Get current time in HH:MM format
      hour: "2-digit",
      minute: "2-digit"
    });

    reminders.forEach(reminder => { // Check each reminder
      if (reminder.time === now) {  // If reminder time matches current time
        console.log(`Reminder: Take ${reminder.medicationName}`);
      }
    });
  });
};
