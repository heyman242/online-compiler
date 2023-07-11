const mongoose = require('mongoose');

const JobSchema = mongoose.Schema({
    language:{
        type: String,
        required: true,
        enum:["cpp", "py"]
    }

});

const Job = new mongoose.model('job', JobSchema);

module.exports = Job;