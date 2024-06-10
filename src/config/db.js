require("dotenv").config({ path: ".env.local" });
const mysql2 = require("mysql2");

let db;

function connectToDatabase() {
  if (!db) {
    db = mysql2.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connecting for testing BE functionality");

    db.connect((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Connected to database successfully!");
      }
    });
    return db;
  } else {
    console.log("Already connected to database.");
    return db;
  }
}

module.exports = connectToDatabase;
