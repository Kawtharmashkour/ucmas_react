//npm install express
const express = require('express');
const app = express();
const morgan = require('morgan'); // middleware library for logging
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

//static file
app.use(express.static(path.join(__dirname, '..', 'Public')));

//session
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if serving over HTTPS, false if not
        maxAge: 3600000 // Sets the cookie expiry time; here it's set to 1 hour
    }
}));
app.use(flash());


//DB Schemas
const User = require('./models/user');
const Program = require('./models/program');
const Course = require('./models/course');

// To use environment var. from .env file
// npm install dotenv
//require('dotenv/config');
require('dotenv').config();
const api = process.env.API_URL;

// Middleware
//Middleware in Express.js, is a function that has access to the request object (req), the response object (res),
//it is used to modularize and enhance the functionality of the application. Middleware functions can be added to the application's request processing pipeline using the app.use() method, 
//where they are executed sequentially for each incoming HTTP request.
app.use(express.json()); //convert data into json format
app.use(morgan('tiny'));
app.use(express.urlencoded({extended: true}));

//use EJS as the view engine
app.set('views', path.join(__dirname, '..', 'Public', 'views'));
app.set('view engine', 'ejs');


// routes
const courseRouters = require('./routers/course');
const programRouters = require('./routers/program');
const userRouters = require('./routers/user');
const gradeRouters = require('./routers/grade');

app.use(`${api}/course`, courseRouters);
app.use(`${api}/program`, programRouters);
app.use(`${api}/user`, userRouters);
app.use(`${api}/grade`, gradeRouters);

// index rounte
app.get('/', (req, res) => {
    res.render('index');  // Ensure you have an index.ejs file in your views directory
})

// dashboard route
app.get('/dashboard', (req, res) => {
    if (req.session && req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.status(401).send('Access denied. Please login to view this page.');
    }
});

// dashboardTeacher Route
app.get('/dashboardTeacher', (req, res) => {
    if (req.session && req.session.user && req.session.user.userType === 'teacher') {
        res.render('dashboardTeacher', { user: req.session.user });
    } else {
        res.status(401).send('Access denied. Please login to view this page.');
    }
});


//render admin dashboard page
app.get('/dashboardAdmin', (req, res) => {
    if (req.session && req.session.user && req.session.user.userType === 'admin') {
        res.render('dashboardAdmin', { user: req.session.user });
    } else {
        res.status(401).send('Access denied. Please login to view this page.');
    }
});

mongoose.set('debug', true); // Enable detailed logging
// Database connection
mongoose.connect(process.env.DB_CONNECTION_STR)
.then(()=> {
    console.log('Database connected successfuly');
})
.catch((err)=> {
    console.log(err);
});

// run the server for development
app.listen(3000, ()=> {
    //call back func. after server creation successfuly
    console.log('Server running on local host with port 3000')
});
