const express = require("express");
const { createSubTask, getAllUserSubTasks, updateSubTask, deleteSubTask } = require("../controller/subTaskController");
const router = express.Router();

router.get("/task/sub/create/:task_id", createSubTask);
router.post("/task/sub/getAll", getAllUserSubTasks);
router.post("/task/sub/update/:subTaskId", updateSubTask);
router.get("/task/sub/delete/:subTaskId", deleteSubTask);

module.exports = router;