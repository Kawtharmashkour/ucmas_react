const mongoose = require('mongoose');

const gradingSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gradeType : {
        type: String,
        enum: ['Assignment', 'Exam'],
        default: 'Assignment'
    },
    grade: [{
        pictures : [{
            type: String
        }],
        score: Number,
        speed: Number,
        accuracy: Number,
        efficiency: Number,
        submittedOn: Date,
        awardPoints: Number
    }]
});

const Grading = mongoose.model("Grading", gradingSchema);
module.exports = Grading;
