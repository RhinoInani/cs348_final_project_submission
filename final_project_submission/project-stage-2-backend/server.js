// File: server.js
// This is your main Express server.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Job = require('./Job'); // Import our Job schema

const app = express();
const PORT = 5001;

// --- Middleware ---
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json()); // Allows server to accept JSON data in request body

// --- MongoDB Connection ---
// !!! REPLACE with your own MongoDB connection string !!!
const MONGO_URI = 'mongodb+srv://tennis_app_user_test:Otv8y4BqNKMgEBA5@348-project.akc1ryz.mongodb.net/?appName=348-project'; 
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- API Endpoints ---

// [GET] /api/jobs - Get all jobs (or filter by status)
// This addresses Requirement 2b (Filter Data & Display Report)
app.get('/api/jobs', async (req, res) => {
    try {
        const filter = {};
        // Check if a 'status' query parameter exists and is not 'All'
        if (req.query.status && req.query.status !== 'All') {
            filter.status = req.query.status;
        }

        // --- NEW SORTING LOGIC ---
        let sortCriteria = {};
        const sortQuery = req.query.sort;

        if (sortQuery === 'createdDate') {
            // "First come, first served" / "normal"
            // We use the 'createdAt' timestamp that Mongoose adds
            sortCriteria = { createdAt: 1 }; // 1 = Ascending (Oldest first)
        } else {
            // Default sort: 'dueDate'
            // "Shortest due date at the top"
            sortCriteria = { dueDate: 1 }; // 1 = Ascending (Soonest first)
        }
        // --- END NEW SORTING LOGIC ---

        const jobs = await Job.find(filter).sort(sortCriteria);
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// [POST] /api/jobs - Create a new job
// This addresses Requirement 2a (Insert)
app.post('/api/jobs', async (req, res) => {
    const { customerName, racketType, stringType, tension, dueDate } = req.body;
    
    const newJob = new Job({
        customerName,
        racketType,
        stringType,
        tension,
        dueDate,
        status: 'Pending' // Default status
    });

    try {
        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/jobs/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        // Build the update object dynamically
        const updateData = {
            status: status
        };

        // If status is "In Progress", set the 'inProgressAt' timestamp
        if (status === 'In Progress') {
            updateData.inProgressAt = Date.now();
        } 
        // If status is "Completed", set the 'completedAt' timestamp
        else if (status === 'Completed') {
            updateData.completedAt = Date.now();
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, // Use $set to update specific fields
            { new: true } 
        );

        if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
        res.json(updatedJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// [DELETE] /api/jobs/:id - Delete a job
// This addresses Requirement 2a (Delete)
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/report', async (req, res) => {
    try {
        // 1. Get all "Completed" jobs that have the necessary timestamps
        const completedJobs = await Job.find({
            status: 'Completed',
            inProgressAt: { $ne: null }, // $ne: null means "not equal to null"
            completedAt: { $ne: null }
        });

        if (completedJobs.length === 0) {
            // Send a default "empty" report
            return res.json({
                stats: {
                    avgHoursToComplete: 0,
                    avgHoursSitting: 0,
                    mostPopularString: 'N/A',
                    totalJobs: 0
                },
                jobs: []
            });
        }

        let totalHoursToComplete = 0;
        let totalHoursSitting = 0;
        const stringCounts = {};
        
        // 2. Process the jobs to calculate stats and add virtual fields
        const reportJobs = completedJobs.map(job => {
            // Calculate "hours sitting" (from creation to in-progress)
            const hoursSitting = (job.inProgressAt - job.createdAt) / (1000 * 60 * 60);
            
            // Calculate "hours to complete" (from in-progress to completed)
            const hoursToComplete = (job.completedAt - job.inProgressAt) / (1000 * 60 * 60);

            // Add to our totals for averages
            totalHoursToComplete += hoursToComplete;
            totalHoursSitting += hoursSitting;

            // Count string types
            stringCounts[job.stringType] = (stringCounts[job.stringType] || 0) + 1;

            // Return a new object with the calculated fields
            return {
                ...job.toObject(), // Convert Mongoose doc to plain object
                hoursSitting: parseFloat(hoursSitting.toFixed(2)),
                hoursToComplete: parseFloat(hoursToComplete.toFixed(2))
            };
        });

        // 3. Find the most popular string
        let mostPopularString = 'N/A';
        let maxCount = 0;
        for (const [string, count] of Object.entries(stringCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostPopularString = string;
            }
        }

        // 4. Calculate final stats
        const stats = {
            avgHoursToComplete: parseFloat((totalHoursToComplete / completedJobs.length).toFixed(2)),
            avgHoursSitting: parseFloat((totalHoursSitting / completedJobs.length).toFixed(2)),
            mostPopularString: mostPopularString,
            totalJobs: completedJobs.length
        };

        // 5. Send the full report
        res.json({ stats, jobs: reportJobs });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});