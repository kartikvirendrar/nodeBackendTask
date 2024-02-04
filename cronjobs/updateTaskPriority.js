const Task = require("../models/taskModel");

const updateTaskPriority = async () => {
  try {
    const tasks = await Task.getAllTasks();
    tasks.forEach(async (task) => {
      const today = new Date();
      const dueDate = new Date(task.due_date);
      let priority = 0;
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysDiff <= 0){
        priority = 0;
      } else if (daysDiff >= 1 && daysDiff <= 2) {
        priority = 1;
      } else if (daysDiff >= 3 && daysDiff <= 4) {
        priority = 2;
      } else {
        priority = 3;
      }
      await Task.updateTaskPriority(task.id, {"priority": priority});
    });
    console.log('Task priorities updated successfully.');
  } catch (error) {
    console.error('Error updating task priorities:', error);
  }
};

module.exports = {updateTaskPriority};