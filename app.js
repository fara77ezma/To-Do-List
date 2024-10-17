const express = require("express");
const createdb = require("./config/db");
const app = express();
const dotenv = require("dotenv");

const server = app.listen(3000);
const tasksRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");

dotenv.config({ path: "./config/config.env" });

app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);
