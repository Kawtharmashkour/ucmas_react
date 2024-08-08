
const mongoose = require('mongoose');

const programSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    curriculum : {
        type : String,
        required : true
    },
    benefits : {
        type : String,
        required : true
    }
}) 

programSchema.virtual('id').get(function(){
    return this._id.toHexString()
});

programSchema.set('toJSON',{virtuals : true});

exports.Program = mongoose.model('Program', programSchema);
