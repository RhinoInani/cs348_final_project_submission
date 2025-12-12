const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    racketType: {
        type: String,
        required: true,
    },
    stringType: {
        type: String,
        required: true,
    },
    tension: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    // --- NEW FIELDS ---
    // We will set these dates as the job moves through the workflow
    inProgressAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
    // --- END NEW FIELDS ---
}, { timestamps: true }); // 'timestamps.createdAt' is our "first come" date

module.exports = mongoose.model('Job', jobSchema);

