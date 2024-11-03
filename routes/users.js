const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.regitserUser);
router.post("/login", userController.login);
router.use(userController.protect);
router.patch("/", userController.updateUser);
router.delete("/", userController.deleteUser);
router.patch("/updatePassword", userController.updatePassword);

module.exports = router;
