const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

// DB Schemas
const User = require('./models/user');
const Program = require('./models/program');
const Course = require('./models/course');

require('dotenv').config();
const api = process.env.API_URL;

// Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(flash());

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

    // Handles any requests that don't match the ones above
    app.get('*', (req, res) =>{
        res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
    });
}

// API routes
const courseRouters = require('./routers/course');
const programRouters = require('./routers/program');
const userRouters = require('./routers/user');
const gradeRouters = require('./routers/grade');

app.use(`${api}/course`, courseRouters);
app.use(`${api}/program`, programRouters);
app.use(`${api}/user`, userRouters);
app.use(`${api}/grade`, gradeRouters);

// After all your API routes
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Database connection
mongoose.connect(process.env.DB_CONNECTION_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connected successfully');
}).catch(err => {
    console.log('Database connection error:', err);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});