const client = require("../config/db");

exports.getTasks = async (req, res) => {
  const text = `SELECT * FROM tasks WHERE user_id = '${req.user.id}'`;
  const result = await client.query(text);
  return res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};

exports.addTask = async (req, res) => {
  const text = `INSERT INTO tasks(title,description,user_id,comment,priority,completed) Values ($1,$2,$3,$4,$5,$6) RETURNING *;`;
  const values = [
    req.body.title,
    req.body.description || null,
    req.user.id,
    req.body.comment || null,
    req.body.priority || "low",
    req.body.completed || false,
  ];
  if (!req.body.title) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a title",
    });
  }
  const result = await client.query(text, values);
  return res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};

exports.updateTask = async (req, res) => {
  const data = await client.query(
    `SELECT * FROM tasks WHERE id = '${req.params.id}'`
  );
  if (!data.rows[0]) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }
  if (data.rows[0].user_id !== req.user.id) {
    return res.status(401).json({
      status: "fail",
      message: "You're not allowed to update this task",
    });
  }

  const text = `
  UPDATE tasks 
  SET title = COALESCE($1, title), 
      description = COALESCE($2, description), 
      completed = COALESCE($3, completed),
      comment = COALESCE($4, comment) ,
      priority = COALESCE($5, priority),
  WHERE id = $6
  RETURNING *;
`;

  const values = [
    req.body.title || null,
    req.body.description || null,
    req.body.completed || null,
    req.body.comment || null,
    req.body.priority,
    req.params.id,
  ];

  const result = await client.query(text, values);
  res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};

exports.deleteTask = async (req, res) => {
  const data = await client.query(
    `SELECT * FROM tasks WHERE id = '${req.params.id}'`
  );
  if (!data.rows[0]) {
    return res.status(404).json({
      status: "fail",
      message: "Task not found",
    });
  }
  if (data.rows[0].user_id !== req.user.id) {
    return res.status(401).json({
      status: "fail",
      message: "You're not allowed to delete this task",
    });
  }
  const text = `
  DELETE FROM tasks 
  WHERE id = ${req.params.id}
  RETURNING *;
`;

  const result = await client.query(text);
  return res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};

exports.getCompletedTasks = async (req, res) => {
  const text = `SELECT * FROM tasks WHERE user_id = '${req.user.id}' AND completed = true;`;
  const result = await client.query(text);
  return res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};

exports.getIncompletedTasks = async (req, res) => {
  const text = `SELECT * FROM tasks WHERE user_id = '${req.user.id}' AND completed = false;`;
  const result = await client.query(text);
  return res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};

exports.getTaskByTitle = async (req, res) => {
  const text = `SELECT * FROM tasks WHERE user_id = '${req.user.id}' AND title ILIKE '%${req.params.title}%';`;
  const result = await client.query(text);
  return res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};

exports.getTaskByPriority = async (req, res) => {
  const text = `SELECT * FROM tasks WHERE user_id = '${req.user.id}' AND priority = '${req.params.priority}';`;
  const result = await client.query(text);
  return res.status(200).json({
    status: "sucess",
    data: result.rows,
  });
};
