const express = require("express");

const router = express.Router();

const taskController = require("../controllers/taskController");
const userController = require("../controllers/userController");

router.use(userController.protect);
router.get("/", taskController.filterTasks);
router.post("/", taskController.addTask);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
