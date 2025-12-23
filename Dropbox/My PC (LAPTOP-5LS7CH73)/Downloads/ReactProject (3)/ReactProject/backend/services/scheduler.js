// backend/services/scheduler.js
/**
 * Simple scheduler:
 * - We take an array of tasks (each with an estimatedDurationHours property; if missing assume 1)
 * - For each day between startDate and endDate we create hourly slots from 08:00 to 20:00
 * - We fill slots sequentially with tasks until tasks are exhausted.
 */

export const generateTimetable = (tasks = [], startDateStr, endDateStr, userSettings = {}) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // normalize (strip time)
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const slots = [];
  const taskQueue = tasks
    .map((t) => ({ ...t })) // shallow copy
    .sort((a, b) => {
      // try by due date then by provided priority/duration
      const da = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
      const db = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
      if (da - db !== 0) return da - db;
      const daur = (a.estimatedDurationHours || 1);
      const dbur = (b.estimatedDurationHours || 1);
      return daur - dbur;
    });

  // iterate days
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // create daily time slots between 08:00 and 20:00 (1 hour each)
    for (let hour = 8; hour < 20; hour++) {
      const slotStart = new Date(d);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(d);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // pick next task that still has remaining hours
      let assignedTask = null;
      while (taskQueue.length > 0) {
        const t = taskQueue[0];
        if (!t.remainingHours && !t.estimatedDurationHours) t.remainingHours = 1;
        if (!t.remainingHours && t.estimatedDurationHours) t.remainingHours = t.estimatedDurationHours;

        if (t.remainingHours > 0) {
          assignedTask = t;
          // allocate one hour
          t.remainingHours -= 1;
          // if task finished, remove from queue
          if (t.remainingHours <= 0) taskQueue.shift();
          break;
        } else {
          taskQueue.shift();
        }
      }

      const slot = {
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        task: assignedTask ? assignedTask._id || assignedTask.id : null,
        status: assignedTask ? 'scheduled' : 'free',
      };

      slots.push(slot);
    }
  }

  return slots;
};

export const getSlotsForDay = (allSlots = [], dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const dayStart = date.getTime();
  const dayEnd = dateStartToEnd(date);
  return allSlots.filter((s) => {
    const st = new Date(s.start).getTime();
    return st >= dayStart && st <= dayEnd;
  });
};

function dateStartToEnd(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}
