const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    stack: [String],
    github: String,
    demo: String,
    image: String
});

module.exports = mongoose.model('Project', ProjectSchema, 'myportofolio'); // Explicitly using 'myportofolio' collection as requested
