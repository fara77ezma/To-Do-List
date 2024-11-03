const client = require("../config/db");

exports.addTask = async (req, res) => {
  try {
    const text = `INSERT INTO tasks(title,description,user_id,comment,priority,completed) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`;
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
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while adding the task",
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
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
          comment = COALESCE($4, comment),
          priority = COALESCE($5, priority)
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
    return res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while updating the task",
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const data = await client.query(
<<<<<<< HEAD
      `SELECT * FROM tasks WHERE id = '${req.params.id}'`
    );

=======
      `SELECT * FROM tasks WHERE id = ${req.params.id}`
    );
>>>>>>> test
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
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while deleting the task",
    });
  }
};

exports.filterTasks = async (req, res) => {
  try {
    const text = `SELECT * FROM tasks WHERE user_id = '${req.user.id}' 
      AND completed = COALESCE($1, completed)
      AND title ILIKE COALESCE('%' || $2 || '%', title)
      AND priority = COALESCE($3, priority);`;

    const values = [
      req.query.completed || null,
      req.query.title || null,
      req.query.priority || null,
    ];

    const result = await client.query(text, values);
    return res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while retrieving tasks",
    });
  }
};
