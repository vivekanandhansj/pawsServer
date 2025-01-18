const express = require('express');
const mysql = require("mysql2");
const app = express();
const dotenv = require("dotenv");
const cors = require('cors');
const cookieParser = require("cookie-parser");


dotenv.config({
    path:"./.env"
});


app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use('/auth', require('./routes/authRoutes'));
app.use('/home',require('./routes/navigationRoutes'));
app.use('/dog',require('./routes/dogRoutes'));
app.use('/volunteer',require('./routes/volunteerRoutes'));
app.use('/notify',require('./routes/notifyRoutes'));
app.use('/dashboard',require('./routes/dashboardRoutes'));

app.listen(5000,()=>{
    console.log("Server started @ port 5000");
})
