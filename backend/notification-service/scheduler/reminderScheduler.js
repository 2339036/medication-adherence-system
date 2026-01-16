//this file checks every minute if any reminder is due and logs it to the console
//only developers see this not users so it was removed as mongoDB was a better optoion

// exports.startScheduler = (reminders) => {
//   const cron = require("node-cron");

//   cron.schedule("* * * * *", () => {    // Runs every minute
//     const now = new Date().toLocaleTimeString([], { // Get current time in HH:MM format
//       hour: "2-digit",
//       minute: "2-digit"
//     });

//     reminders.forEach(reminder => { // Check each reminder
//       if (reminder.time === now) {  // If reminder time matches current time
//         console.log(`Reminder: Take ${reminder.medicationName}`);
//       }
//     });
//   });
// };
