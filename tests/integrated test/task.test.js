const request = require("supertest");
const server = require("../../app");
const client = require("../../config/db");
const taskController = require("../../controllers/taskController");
const { query } = require("express");

let token;
beforeEach(async () => {
  const response = await request(server).post("/api/users/register").send({
    email: "farah@example.com",
    name: "Farah",
    password: "password123",
  });

  // console.log(response.body);
  token = response.body.token;
});
beforeEach(async () => {
  await client.query("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE");
});
afterEach(async () => {
  await client.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
});
describe("Filter Tasks API", () => {
  it("should return all tasks", async () => {
    await client.query(
      `INSERT INTO tasks(title,description,priority,completed,user_id) VALUES('Task 1','Description 1','high',true,1)`
    );
    const response = await request(server)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toMatchObject({ title: "Task 1" });
  });
  it("should return all tasks with high priority", async () => {
    await client.query(
      `INSERT INTO tasks(title,description,priority,completed,user_id) VALUES('Task 1','Description 1','high',true,1),( 'Task 2','Description 2','low',false,1)`
    );
    const response = await request(server)
      .get("/api/tasks/?priority=high")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toMatchObject({ title: "Task 1" });
  });
  it("should return all completed tasks", async () => {
    await client.query(
      `INSERT INTO tasks(title,description,priority,completed,user_id) VALUES('Task 1','Description 1','high',true,1),( 'Task 2','Description 2','low',false,1)`
    );
    const response = await request(server)
      .get("/api/tasks/?completed=true")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toMatchObject({ title: "Task 1" });
  });
  it("should return all tasks with title starts with Task", async () => {
    await client.query(
      `INSERT INTO tasks(title,description,priority,completed,user_id) VALUES('Task 1','Description 1','high',true,1),( 'Task 2','Description 2','low',false,1)`
    );
    const response = await request(server)
      .get("/api/tasks/?title=Task")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0]).toMatchObject({ title: "Task 1" });
    expect(response.body.data[1]).toMatchObject({ title: "Task 2" });
  });
});

describe("Add Task API", () => {
  it("should add a task", async () => {
    const response = await request(server)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task 1",
        description: "Description 1",
        priority: "high",
        completed: true,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data[0]).toMatchObject({ title: "Task 1" });
  });
  it("should fail and return 400", async () => {
    const response = await request(server)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Description 1",
        priority: "high",
        completed: true,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      status: "fail",
      message: "Please provide a title",
    });
  });
});

describe("update Task API", () => {
  it("should update a task", async () => {
    await client.query(
      `INSERT INTO tasks(title,description,priority,completed,user_id) VALUES('Task 1','Description 1','high',true,1)`
    );

    const response = await request(server)
      .patch("/api/tasks/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task 2",
        description: "Description 2 updated",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      title: "Task 2",
      description: "Description 2 updated",
    });
  });
  it("should fail and return 404", async () => {
    const response = await request(server)
      .patch("/api/tasks/2")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task 2",
        description: "Description 2 updated",
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      status: "fail",
      message: "Task not found",
    });
  });

  it("should fail and return 500", async () => {
    const response = await request(server)
      .patch("/api/tasks/b")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task 2",
        description: "Description 2 updated",
      });
    expect(response.statusCode).toBe(500);
    expect(response.body).toMatchObject({
      status: "fail",
      message: "An error occurred while updating the task",
    });
  });
});

describe("delete Task API", () => {
  it("should delete a task", async () => {
    await client.query(
      `INSERT INTO tasks(title,description,priority,completed,user_id) VALUES('Task 1','Description 1','high',true,1)`
    );

    const response = await request(server)
      .delete(`/api/tasks/1`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      title: "Task 1",
      description: "Description 1",
    });
  });
  it("should fail and return 404", async () => {
    const response = await request(server)
      .delete("/api/tasks/2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      status: "fail",
      message: "Task not found",
    });
  });

  it("should fail and return 500", async () => {
    const response = await request(server)
      .delete("/api/tasks/b")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(500);
    expect(response.body).toMatchObject({
      status: "fail",
      message: "An error occurred while deleting the task",
    });
  });
});
