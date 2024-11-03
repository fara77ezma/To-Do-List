const { Client } = require("pg");
const connectionString = `${process.env.DATABASE_ConnectionString}`;
const client = new Client({
  connectionString,
});
async function connectToDatabase() {
  await client.connect();
  console.log("Connected to database");
  await client.query(
    `CREATE TABLE IF NOT EXISTS users (id bigint GENERATED ALWAYS AS IDENTITY  PRIMARY KEY ,
    name text, email text, password text)`
  );
  await client.query(
    `CREATE TABLE IF NOT EXISTS tasks (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      title text NOT NULL,
      description text,
      date DATE DEFAULT CURRENT_DATE NOT NULL,
      time TIME DEFAULT CURRENT_TIME NOT NULL,
      completed boolean DEFAULT false NOT NULL,
      user_id bigint REFERENCES users(id) ON DELETE CASCADE, 
      comment text,
      priority text DEFAULT 'low' NOT NULL
    )`
  );
}

connectToDatabase();
module.exports = client;
