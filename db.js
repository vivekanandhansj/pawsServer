const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASS,
    database:process.env.DATABASE
});


db.connect((err) => {
    if(err){
        console.log('Database connection failed');
    }
    console.log("Database connected successfully");
})
module.exports = db;