const express = require("express");

const router = express.Router();

const taskController = require("../controllers/taskController");
const userController = require("../controllers/userController");

router.use(userController.protect);
router.get("/", taskController.getTasks);
router.get("/:title", taskController.getTaskByTitle);

router.post("/", taskController.addTask);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);
router.get("/completed", taskController.getCompletedTasks);
router.get("/incompleted", taskController.getIncompletedTasks);
router.get("/priority/:priority", taskController.getTaskByPriority);

module.exports = router;
