const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const express = require("express");
const app = express();

app.listen(3000);
const tasksRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");

app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);
