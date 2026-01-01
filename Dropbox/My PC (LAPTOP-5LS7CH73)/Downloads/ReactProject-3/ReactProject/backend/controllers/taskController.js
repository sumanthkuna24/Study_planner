import Task from '../models/Task.js';

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for logged in user
 */
export const getTasks = async (req, res) => {
  try {
    const { completed, subject } = req.query;
    const query = { user: req.user._id };

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    if (subject) {
      query.subject = subject;
    }

    const tasks = await Task.find(query)
      .populate('subject', 'title color')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const { title, subject, durationMinutes, dueDate } = req.body;

    const task = await Task.create({
      title,
      subject,
      durationMinutes,
      dueDate: new Date(dueDate),
      user: req.user._id,
    });

    const populatedTask = await Task.findById(task._id).populate(
      'subject',
      'title color'
    );

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, subject, durationMinutes, dueDate, completed } =
      req.body;

    task.title = title || task.title;
    task.subject = subject || task.subject;
    task.durationMinutes = durationMinutes || task.durationMinutes;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    // priority and preferredTime have been removed
    if (completed !== undefined) task.completed = completed;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate(
      'subject',
      'title color'
    );

    res.json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};




