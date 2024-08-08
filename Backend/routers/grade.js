const express = require('express');
const router = express.Router();
const Grading = require('../models/grade'); 

const fs = require('fs');
const dir = './uploads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const multer = require('multer'); // for upload pictures
const Tesseract = require('tesseract.js'); // for OCR

// for upload pictures
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });

router.post('/submitAssignment', upload.array('pictures'), (req, res) => {
    const { courseId, studentId, gradeType } = req.body;
    let images = req.files.map(file => file.path);

    // Use OCR to process each image
    let results = images.map(image => {
        return new Promise((resolve, reject) => {
            worker.recognize(image)
                .then(result => {
                    resolve({ text: result.text });
                })
                .catch(error => {
                    reject(error);
                });
        });
    });

    Promise.all(results).then(ocrResults => {
        const totalScore = ocrResults.reduce((acc, curr) => {
            // Future work: Implement logic to calculate score from OCR text
            //return acc + parseScoreFromOCRText(curr.text); 
            return parseScoreFromOCRText(curr.text); 
        }, 0);

        // Create a new grading entry
        const newGrading = new Grading({
            course: courseId,
            student: studentId,
            gradeType: gradeType,
            grade: [{
                pictures: images,
                score: totalScore,
                submittedOn: new Date(),
                
            }]
        });

        newGrading.save()
            .then(() => res.json({ message: 'Assignment submitted successfully!', score: totalScore }))
            .catch(err => res.status(400).json('Error: ' + err));
    });
});

// More future work
function parseScoreFromOCRText(text) {
    // Implement your logic to extract and calculate the score from OCR text
    return parseInt(text); // Simple placeholder
}

//Exporting the whole module (file)
module.exports = router;