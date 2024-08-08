const express = require('express');
const { Program } = require('../models/program');

//Router class in Express.js is used to create modular route handlers. 
//It allows you to define 1.routes, 2.middleware, and 3.request handlers in a separate file or module, 
//making your code more organized and maintainable.
const router = express.Router();

// Get all programes
router.get(`/`, async (req, res) =>{
    const programList = await Program.find();

    if(!programList) {
        res.status(500).json({success: false})
    } 
    res.send(programList);
})

//get program by id
router.get('/:id', async(req, res) =>{
    const program = await Program.findById(req.params.id);

    if (!program){
        res.status(500).json({success : false, message: 'Program is not found with the given ID.'})
    }
    res.status(200).send(program);

})

//Exporting the whole module (file)
module.exports = router;