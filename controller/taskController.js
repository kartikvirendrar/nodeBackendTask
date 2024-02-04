const SubTask = require('../models/subTaskModel');
const Task = require('../models/taskModel');

const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, due_date } = req.body;
    if(title === undefined || description === undefined || due_date === undefined){
      return res.status(500).json({ error: 'Missing mandatory fields' });
    }
    const isValidDate = !isNaN(new Date(due_date).getTime());
    if (!isValidDate) {
      return res.status(400).json({ error: 'Invalid due_date format' });
    }
    const task = await Task.create(userId, title, description, due_date);

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { priority, due_date, page, pageSize } = req.body;
    const tasks = await Task.getAllUserTasks(userId, priority, due_date, page, pageSize);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const { due_date, status } = req.body;
    if (status === undefined && due_date === undefined){
      return res.status(500).json({ error: 'Missing mandatory fields' });
    }
    if (status !== "TODO" && status !== "DONE" && status !== undefined){
      return res.status(400).json({ error: 'Invalid status' });
    }
    const isValidDate = !isNaN(new Date(due_date).getTime());
    if (!isValidDate) {
      return res.status(400).json({ error: 'Invalid due_date format' });
    }
    const updatedTask = await Task.updateTask(userId, taskId, { due_date, status });
    const subTasks = await SubTask.getAllTaskSubTasks(taskId)
    subTasks.map(async (subT) => {
      await SubTask.updateSubTaskFunction(subT.id, {status: status==="TODO" ? 0 : 1});
    })
    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const subTasks = await SubTask.getAllTaskSubTasks(taskId);
    subTasks.map(async (subT) => {
      await SubTask.softDeleteSubTask(userId, subT.id);
    })
    const deletedTask = await Task.softDeleteTask(userId, taskId);

    res.status(200).json({ message: 'Task soft deleted successfully', task: deletedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createTask, getAllUserTasks, updateTask, deleteTask };