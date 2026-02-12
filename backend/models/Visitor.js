const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    userAgent: String,
    ip: String
});

module.exports = mongoose.model('Visitor', VisitorSchema);
