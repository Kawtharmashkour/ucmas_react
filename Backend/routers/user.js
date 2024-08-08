const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { Course } = require('../models/course');
const { route } = require('./course');

//Route to render the login page
router.get("/login", (req,res) => {
    res.render('login', {
        messages: {
            error: req.flash('error')
        }
    });
});

//Route to handle user login
/*router.post("/login", async (req, res) => {
    try {
        const email = req.body.email.trim();
        console.log("Searching for user with email:", email);
        const user = await User.findOne({ email: email });
        console.log("User found:", user);
        if (!user) {
            return res.status(404).send("User account cannot be found.");
        }

        // Compare the hash password from the database with the plain text
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            req.session.user = user;  // Store user information in session

            // Check user role and redirect accordingly
            if (user.userType === 'student') {
                res.redirect('/dashboard');  // Redirect to student dashboard
            } else if (user.userType === 'teacher') {
                res.redirect('/dashboardTeacher');  // Redirect to teacher dashboard
            } else if (user.userType === 'admin') {
                res.redirect('/dashboardAdmin'); // Redirect to admin dashboard
            } else {
                res.redirect('/'); // Default redirect if role is not specified

            }
        } else {
            res.status(401).send("Incorrect password"); // Use HTTP 401 for incorrect credentials
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during login"); // Use HTTP 500 for server errors
    }
});*/
router.post("/login", async (req, res) => {
    try {
        const email = req.body.email.trim();
        console.log("Searching for user with email:", email);
        const user = await User.findOne({ email: email });
        if (!user) {
            req.flash('error', 'User account cannot be found.');
            return res.redirect('/api/v1/user/login');
        }

        // Compare the hash password from the database with the plain text
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            req.session.user = user;  // Store user information in session

            // Redirect based on user role
            switch (user.userType) {
                case 'student':
                    res.redirect('/dashboard');
                    break;
                case 'teacher':
                    res.redirect('/dashboardTeacher');
                    break;
                case 'admin':
                    res.redirect('/dashboardAdmin');
                    break;
                default:
                    res.redirect('/');
            }
        } else {
            req.flash('error', 'Incorrect password');
            res.redirect('/api/v1/user/login');
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/api/v1/user/login');
    }
});

// Route to render the signup page
router.get("/signup", (req, res) => {
    res.render('signup', {
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
});


// Route to handle user registration
/*router.post('/signup', async (req, res) => {
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).send('Email already in use, please try another email');
        }

        // If no existing user was found, proceed to create a new user
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            userType: req.body.userType,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).send("User created successfully");
    } catch (error) {
        console.error(error); 
        res.status(400).send(error.message);
    }
});*/
router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            req.flash('error', 'Email already in use, please try another email');
            return res.redirect('/api/v1/user/signup');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            userType: req.body.userType,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        req.flash('success', 'User created successfully. Please login.');
        res.redirect('/api/v1/user/signup');
    } catch (error) {
        console.error(error);
        req.flash('error', error.message);
        res.redirect('/api/v1/user/signup');
    }
});

// Student registers for a course
router.post('/register-course', async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const user = await User.findById(userId);
        // Check if already registered before
        if (user.courses.some(c => c.course.toString() === courseId)) {
            return res.status(400).json({ message: "Already registered for this course" });
        }
        // Add course with pending status
        user.courses.push({ course: courseId, status: 'pending' });
        await user.save();

        res.status(200).json({ message: "Registration pending approval" });
    } catch (error) {
        res.status(500).json({ message: "Error registering for course", error: error.message });
    }
});

// API to retrieve all students with pending course registrations
router.get('/students/pending', async (req, res) => {
    try {
        // Find all users with courses that have a status of 'pending'
        const studentsWithPendingCourses = await User.find({
            'courses.status': 'pending'
        }).populate('courses.course');

        // Filter and restructure the data to be more readable
        const pendingRegistrations = studentsWithPendingCourses.map(user => ({
            userId: user._id,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            pendingCourses: user.courses.filter(course => course.status === 'pending').map(course => ({
                courseId: course.course._id,
                courseName: course.course.name,
                registrationDate: course.registrationDate
            }))
        }));

        res.status(200).json(pendingRegistrations);
    } catch (error) {
        console.error('Error fetching students with pending course registrations:', error);
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
});

// Route to approve a student's course registration
router.post('/students/approve/:userId/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    try {
        const user = await User.findById(userId);
        const course = user.courses.find(c => c.course.toString() === courseId);
        if (course) {
            course.status = 'registered'; // Change status to registered
            await user.save();

           // Add userId to course students only if not already present using ($addToSet:)
            const updatedCourse = await Course.findByIdAndUpdate(courseId, {
                $addToSet: { students: userId }
            }, { new: true });  // Returns the updated document

            res.status(200).json({ message: 'Registration approved' });
        } else {
            res.status(404).send('Registration not found');
        }
    } catch (error) {
        console.error('Error approving registration:', error);
        res.status(500).send('Error approving registration');
    }
});

// Route to delete a student's course registration
router.delete('/students/delete/:userId/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    try {
        const user = await User.findById(userId);
        user.courses = user.courses.filter(c => c.course.toString() !== courseId);
        await user.save();
        res.status(200).json({ message: 'Registration deleted' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).send('Error deleting registration');
    }
});


// Export the router
module.exports = router;
