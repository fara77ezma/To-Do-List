const client = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const createSendToken = (data, statusCode, res) => {
  const id = data.rows[0].id;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return res.status(statusCode).json({
    status: "success",
    token,
    data: { name: data.rows[0].name, email: data.rows[0].email },
  });
};

<<<<<<< HEAD
exports.regitserUser = async (req, res) => {
=======
exports.regitserUser = async (req, res, next) => {
>>>>>>> test
  try {
    const data = await client.query(
      `SELECT * FROM users WHERE email='${req.body.email}'`
    );
    if (data.rows[0]) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(req.body.password, salt);
    const text = `INSERT INTO users(name,email,password) Values ('${req.body.name}','${req.body.email}','${hash}') RETURNING name, email, id ;`;
    const result = await client.query(text);
    createSendToken(result, 200, res);
  } catch (error) {
<<<<<<< HEAD
    console.error(error);
=======
>>>>>>> test
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while registering the user",
    });
  }
};

<<<<<<< HEAD
exports.login = async (req, res) => {
=======
exports.login = async (req, res, next) => {
>>>>>>> test
  try {
    const text = `SELECT * FROM users WHERE email='${req.body.email}'`;
    const result = await client.query(text);

    if (
      !result.rows[0] ||
      !(await bcrypt.compare(req.body.password, result.rows[0].password))
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email or password",
      });
    } else {
      createSendToken(result, 200, res);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while logging in",
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You're not logged in! Please log in to get access",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const text = `SELECT * FROM users WHERE id=${decoded.id}`;
    const result = await client.query(text);

    if (!result.rows[0]) {
<<<<<<< HEAD
      return res.json({
=======
      return res.status(401).json({
>>>>>>> test
        status: "fail",
        message: "The user belonging to this token does no longer exist",
      });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while verifying token",
    });
  }
};

<<<<<<< HEAD
exports.updateUser = async (req, res) => {
=======
exports.updateUser = async (req, res, next) => {
>>>>>>> test
  try {
    const text = `
      UPDATE users 
      SET name = COALESCE($1, name), 
          email = COALESCE($2, email)
      WHERE id = $3
      RETURNING name,email,id;
    `;

    const values = [req.body.name || null, req.body.email || null, req.user.id];

    const result = await client.query(text, values);
    return res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while updating user",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const text = `SELECT * FROM users WHERE id='${req.user.id}'`;
    const result = await client.query(text);

    if (
      !(await bcrypt.compare(req.body.currentPassword, result.rows[0].password))
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid password",
      });
    } else {
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(req.body.newPassword, salt);
      const text = `UPDATE users SET password='${hash}' WHERE id=${req.user.id} RETURNING name, email,id`;
      const updateresult = await client.query(text);
      return res.status(200).json({
        status: "success",
        data: updateresult.rows,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while updating password",
    });
  }
};

<<<<<<< HEAD
exports.deleteUser = async (req, res) => {
=======
exports.deleteUser = async (req, res, next) => {
>>>>>>> test
  try {
    const text = `DELETE FROM users WHERE id=${req.user.id} RETURNING *`;
    const result = await client.query(text);
    return res.status(200).json({
      status: "success",
      message: "User and associated tasks deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while deleting the user",
    });
  }
};
