const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Helper function to send the session user's info without the password
const getUserSessionInfo = (user) => {
    const { password, ...userInfo } = user._doc; // Assuming that the user model includes a password
    return userInfo;
};

// Route to handle user login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password'); // Ensure the password is selected if it's set not to select by default
        if (!user) {
            return res.status(404).json({ error: 'User account cannot be found.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            req.session.user = getUserSessionInfo(user);
            return res.json({ message: 'Login successful', user: req.session.user });
        } else {
            return res.status(401).json({ error: 'Incorrect password' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Route to handle user registration
router.post('/signup', async (req, res) => {
    try {
        const { userType, firstName, lastName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use, please try another email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            userType,
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({ message: 'User created successfully. Please login.' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
});

// Route to log out
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Student registers for a course
router.post('/register-course', async (req, res) => {
    const { userId, courseId } = req.body;
    const user = await User.findById(userId);
    if (user.courses.some(c => c.course.toString() === courseId)) {
        return res.status(400).json({ error: "Already registered for this course" });
    }

    user.courses.push({ course: courseId, status: 'pending' });
    await user.save();
    res.status(200).json({ message: "Registration pending approval" });
});

// Route to handle API to retrieve all students with pending course registrations
router.get('/students/pending', async (req, res) => {
    const studentsWithPendingCourses = await User.find({ 'courses.status': 'pending' }).populate('courses.course');
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
    res.json(pendingRegistrations);
});

// Route to approve a student's course registration
router.post('/students/approve/:userId/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    const user = await User.findById(userId);
    const courseIndex = user.courses.findIndex(c => c.course.toString() === courseId);
    if (courseIndex !== -1) {
        user.courses[courseIndex].status = 'registered';
        await user.save();
        await Course.findByIdAndUpdate(courseId, { $addToSet: { students: userId } }, { new: true });
        res.json({ message: 'Registration approved' });
    } else {
        res.status(404).json({ error: 'Registration not found' });
    }
});

// Route to delete a student's course registration
router.delete('/students/delete/:userId/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    const user = await User.findById(userId);
    user.courses = user.courses.filter(c => c.course.toString() !== courseId);
    await user.save();
    res.json({ message: 'Registration deleted' });
});

module.exports = router;