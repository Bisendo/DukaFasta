require("dotenv").config();

const mysql = require("mysql2");
const fs = require("fs");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync("./ca.pem")
    },

    connectTimeout: 30000
});

connection.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:");
        console.error(err);
        return;
    }

    console.log("✅ MYSQL CONNECTED TO AIVEN!");

    connection.query("SELECT 1 + 1 AS result", (error, results) => {
        if (error) {
            console.error(error);
        } else {
            console.log(results);
        }

        connection.end();
    });
});
