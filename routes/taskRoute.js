const express = require("express");
const { createTask, getAllUserTasks, updateTask, deleteTask } = require("../controller/taskController");
const router = express.Router();

router.post("/task/create", createTask);
router.post("/task/getAll", getAllUserTasks);
router.post("/task/update/:taskId", updateTask);
router.get("/task/delete/:taskId", deleteTask);

module.exports = router;