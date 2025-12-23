// backend/controllers/timetableController.js
import TimetableSlot from '../models/TimetableSlot.js';
import Task from '../models/Task.js';
import { generateTimetable } from '../services/scheduler.js';

/**
 * POST /api/timetable/generate
 * body: { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 */
export const generateTimetableSlots = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate required' });

    // assume req.user set by protect middleware
    const userId = req.user ? req.user._id : null;

    // load user tasks (only incomplete ones)
    const tasks = await Task.find({ user: userId, completed: { $ne: true } }).lean();

    // generate slots (array of objects with start, end, task)
    const slots = generateTimetable(tasks, startDate, endDate, {});

    // Remove any existing slots for this user within the range
    const start = new Date(startDate); start.setHours(0, 0, 0, 0);
    const end = new Date(endDate); end.setHours(23, 59, 59, 999);

    try {
      await TimetableSlot.deleteMany({
        start: { $gte: start, $lte: end },
        user: userId,
      });
    } catch (e) {
      // schema might not have user field; if delete fails, ignore and continue
    }

    // Save generated slots
    const toInsert = slots.map((s) => ({
      start: s.start,
      end: s.end,
      task: s.task || null,
      status: s.status || 'free',
      user: userId,
    }));

    const created = await TimetableSlot.insertMany(toInsert);

    // populate task and subject for convenience
    const populated = await TimetableSlot.find({
      _id: { $in: created.map((c) => c._id) },
    }).populate({
      path: 'task',
      populate: { path: 'subject', select: 'title color' },
    }).lean();

    return res.json({ created: populated });
  } catch (error) {
    console.error('generateTimetableSlots error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/timetable/day?date=YYYY-MM-DD
 */
export const getDayTimetable = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query required' });

    const userId = req.user ? req.user._id : null;

    // fetch slots for that date
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);

    const slots = await TimetableSlot.find({
      start: { $gte: start, $lte: end },
      user: userId,
    }).populate({
      path: 'task',
      populate: { path: 'subject', select: 'title color' },
    }).sort({ start: 1 }).lean();

    return res.json({ slots });
  } catch (error) {
    console.error('getDayTimetable error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/timetable/:id
 * body: { status, task } - update slot
 */
export const updateTimetableSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const updates = req.body;
    const updated = await TimetableSlot.findByIdAndUpdate(slotId, updates, { new: true }).populate({
      path: 'task',
      populate: { path: 'subject', select: 'title color' },
    });
    if (!updated) return res.status(404).json({ message: 'Slot not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/timetable/:id/done
 */
export const markSlotDone = async (req, res) => {
  try {
    const slotId = req.params.id;
    const updated = await TimetableSlot.findByIdAndUpdate(slotId, { status: 'done' }, { new: true }).populate({
      path: 'task',
      populate: { path: 'subject', select: 'title color' },
    });
    if (!updated) return res.status(404).json({ message: 'Slot not found' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
