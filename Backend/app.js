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
    cookie: { secure: false, maxAge: 3600000 } // secure: true in production if using HTTPS
}));

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
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

// Handle React routing, return all requests to React app
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
const port = process.env.PORT || 3001; // Change to a different port if 5000 is in use
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});