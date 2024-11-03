const {
  addTask,
  updateTask,
  deleteTask,
  filterTasks,
} = require("../../controllers/taskController");
const client = require("../../config/db");
client.query = jest.fn();
let req, res;

beforeEach(() => {
  client.query.mockReset();
  req = {
    body: {},
    query: {},
    user: { id: 1 },
  };
  res = {
    status: jest.fn().mockReturnThis(), // to return the res object itself to use in .json() chain
    json: jest.fn(),
  };
});
afterAll(() => {
  client.query.mockReset();
});

describe("Add Task", () => {
  it("should return 400 if title is not provided", async () => {
    req.body = {};
    await addTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Please provide a title",
    });
  });
  it("should return 200", async () => {
    req.body = { title: "test" };
    // req.user = { id: 1 };
    client.query.mockResolvedValue({ rows: [{ title: "test" }] });

    await addTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: [{ title: "test" }],
    });
  });
});

describe("Update Task", () => {
  it("should return 404 if task is not found", async () => {
    client.query.mockResolvedValue({ rows: [] });
    req.params = { id: 1 };
    await updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Task not found",
    });
  });
  it("should return 401 if user is not the owner of the task", async () => {
    //data.rows[0].user_id !== req.user.id
    client.query.mockResolvedValue({ rows: [{ user_id: 2 }] });
    req.params = { id: 1 };
    await updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "You're not allowed to update this task",
    });
  });

  it("should return 200 if task updated successfully", async () => {
    //data.rows[0].user_id !== req.user.id
    client.query.mockResolvedValue({ rows: [{ user_id: 1 }] });
    req.params = { id: 1 };

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: [{ user_id: 1 }],
    });
  });
});

describe("Delete Task", () => {
  it("should return 404 if task is not found", async () => {
    client.query.mockResolvedValue({ rows: [] });
    req.params = { id: 1 };
    await deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Task not found",
    });
  });
  it("should return 401 if user is not the owner of the task", async () => {
    //data.rows[0].user_id !== req.user.id
    client.query.mockResolvedValue({ rows: [{ user_id: 2 }] });
    req.params = { id: 1 };
    await deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "You're not allowed to delete this task",
    });
  });

  it("should return 200 if task deleted successfully", async () => {
    //data.rows[0].user_id !== req.user.id
    client.query.mockResolvedValue({ rows: [{ user_id: 1 }] });
    req.params = { id: 1 };

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: [{ user_id: 1 }],
    });
  });
});

describe("Filter Task", () => {
  it("should return 200 if no database error happened", async () => {
    //data.rows[0].user_id !== req.user.id
    client.query.mockResolvedValue({ rows: [{ user_id: 1 }] });
    req.params = { id: 1 };

    await filterTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: [{ user_id: 1 }],
    });
  });
});
