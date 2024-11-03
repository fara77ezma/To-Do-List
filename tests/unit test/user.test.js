const {
  regitserUser,
  login,
  updateUser,
  updatePassword,
  deleteUser,
  protect,
} = require("../../controllers/userController");
const client = require("../../config/db");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

client.query = jest.fn();
let req, res;
const env = process.env;
beforeEach(() => {
  process.env = { ...env };
  process.env.JWT_SECRET = "test_secret_key";
  process.env.JWT_EXPIRES_IN = "1h";
  client.query.mockReset();
  req = {
    body: {},
    user: { id: 1 },
    headers: {},
  };
  res = {
    status: jest.fn().mockReturnThis(), // to return the res object itself to use in .json() chain
    json: jest.fn(),
  };
});

afterAll(() => {
  client.query.mockReset();
  process.env = env;
  jwt.verify.mockReset();
  bcrypt.compare.mockReset();
});

describe("Register User", () => {
  it("should return 400 if user already exists", async () => {
    client.query.mockResolvedValue({
      rows: [{ name: "test", email: "test@example.com" }],
    });
    req.body = { email: "test@example.com" };
    await regitserUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "User already exists",
    });
  });

  it("should return 200 if user register successfully", async () => {
    client.query.mockResolvedValueOnce({ rows: [] });
    req.body = { name: "test", email: "test@example.com", password: "test" };
    client.query.mockResolvedValueOnce({
      rows: [{ name: "test", email: "test@example.com", id: 1 }],
    });

    await regitserUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      token: expect.any(String),
      data: { name: "test", email: "test@example.com" },
    });
  });
});

describe("login", () => {
  it("should return 400 if user not exists", async () => {
    client.query.mockResolvedValue({
      rows: [],
    });
    req.body = { email: "test@example.com" };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Invalid email or password",
    });
  });
  it("should return 400 if password not correct", async () => {
    client.query.mockResolvedValue({
      rows: [{ password: "test1" }],
    });
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    req.body = { email: "test@example.com", password: "test" };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Invalid email or password",
    });
  });

  it("should return 200 if user logged in successfully", async () => {
    client.query.mockResolvedValueOnce({
      rows: [{ name: "test", email: "test@example.com", password: "test" }],
    });
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    req.body = { email: "test@example.com", password: "test" };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      token: expect.any(String),
      data: { name: "test", email: "test@example.com" },
    });
  });
});

describe("Update Current User", () => {
  it("should return 200 if user updated successfully", async () => {
    client.query.mockResolvedValue({ rows: [{ name: "test" }] });

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: [{ name: "test" }],
    });
  });
});

describe("Update Current User Password", () => {
  it("should return 400 if current password not correct", async () => {
    client.query.mockResolvedValue({
      rows: [{}],
    });
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    //req.body = { email: "test@example.com", password: "test" };
    await updatePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Invalid password",
    });
  });

  it("should return 200 if user updated successfully", async () => {
    client.query.mockResolvedValue({ rows: [{ name: "test" }] });
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    req.body = { currentPassword: "test", newPassword: "test" };
    await updatePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: [{ name: "test" }],
    });
  });
});

describe("Delete Current User", () => {
  it("should return 200 if user deleted successfully", async () => {
    client.query.mockResolvedValue({ rows: [{ name: "test" }] });

    await deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "User and associated tasks deleted successfully.",
    });
  });
});

describe("protect", () => {
  it("should return 401 if user not logged in", async () => {
    await protect(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "You're not logged in! Please log in to get access",
    });
  });
  it("should return 401 if token does no longer exist ", async () => {
    jwt.verify = jest.fn().mockImplementation((token, secret, callback) => {
      // Simulate the callback behavior of jwt.verify
      callback(null, { id: 1 }); // Simulate a successful decoded token with id: 1
    });

    client.query.mockResolvedValue({ rows: [] });
    req.headers.authorization = "Bearer token";
    await protect(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "The user belonging to this token does no longer exist",
    });
  });

  it("should return 200 if token is valid", async () => {
    jwt.verify = jest.fn().mockImplementation((token, secret, callback) => {
      // Simulate the callback behavior of jwt.verify
      callback(null, { id: 1 }); // Simulate a successful decoded token with id: 1
    });

    client.query.mockResolvedValue({ rows: [{ name: "test", id: 1 }] });
    req.headers.authorization = "Bearer token";
    await protect(req, res);

    expect(req.user).toEqual({ name: "test", id: 1 });
  });
});
