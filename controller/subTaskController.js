const SubTask = require('../models/subTaskModel');
const Task = require('../models/taskModel');

const getSubTasksStatusFunction = async (task_id) => {
  const subTasks = await SubTask.getAllTaskSubTasks(task_id);
  var zero = false, one = false;
  subTasks.map((subT) => {
    if (subT.status === 0) {
      zero = true;
    } else {
      one = true;
    }
  })
  if (zero && one) {
    return "IN_PROGRESS";
  } else if (zero) {
    return "TODO";
  } else {
    return "DONE";
  }
};

const createSubTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { task_id } = req.params;
    const subTask = await SubTask.create(userId, task_id);
    const taskStatus = { status: await getSubTasksStatusFunction(task_id) };
    Task.updateTask(userId, task_id, taskStatus);

    res.status(201).json({ message: 'Subtask created successfully', subTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUserSubTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { task_id } = req.body;
    let subtasks = [];
    if (task_id === undefined) {
      const tasks = await Task.getAllUserTasks(userId);
      for (const task of tasks) {
        let taskSubtasks = await SubTask.getAllTaskSubTasks(task.id);
        taskSubtasks.map((subT) => {
          subtasks.push(subT);
        })
      }
    } else {
      const task = await Task.collection.doc(task_id).get();
      if (!task.data().users.includes(userId)){
        throw new Error('Unauthorized to get sub tasks');  
      }else{
        subtasks = await SubTask.getAllTaskSubTasks(task_id);
      }
    }
    res.status(200).json(subtasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subTaskId } = req.params;
    const { status } = req.body;
    if (status === undefined) {
      return res.status(500).json({ error: 'Missing mandatory fields' });
    }
    if (status !== 0 && status !== 1) {
      return res.status(500).json({ error: 'Invalid status' });
    }
    const updatedSubTask = await SubTask.updateSubTask(userId, subTaskId, { status });
    const taskStatus = { status: await getSubTasksStatusFunction(updatedSubTask.task_id) };
    Task.updateTask(userId, updatedSubTask.task_id, taskStatus);
    res.status(200).json({ message: 'Subtask updated successfully', subTask: updatedSubTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSubTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subTaskId } = req.params;
    const deletedSubTask = await SubTask.softDeleteSubTask(userId, subTaskId);

    res.status(200).json({ message: 'Subtask soft deleted successfully', subTask: deletedSubTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createSubTask, getAllUserSubTasks, updateSubTask, deleteSubTask };