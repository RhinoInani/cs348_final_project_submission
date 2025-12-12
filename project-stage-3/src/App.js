// File: src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// --- NEW IMPORTS ---
import JobCard from './JobCard';
import Report from './Report';

// --- API Configuration ---
// const api = axios.create({
//     baseURL: 'https://us-central1-cs348-project-e4027.cloudfunctions.net/api',
// });
const api = axios.create({
    baseURL: 'https://api-rg3xpnythq-uc.a.run.app/api',
});

// --- Hardcoded String Types ---
const hardcodedStringTypes = [
    'Babolat RPM Blast',
    'Solinco Hyper-G',
    'Technifibre X-One Biphase',
    'Wilson Synthetic Gut Power',
    'Head Lynx Tour',
    'Natural Gut'
];

function App() {
    // --- State Variables ---
    const [jobs, setJobs] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [racketType, setRacketType] = useState('');
    const [stringType, setStringType] = useState(hardcodedStringTypes[0]);
    const [tension, setTension] = useState(50);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [filter, setFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('dueDate');

    // --- Effects ---
    useEffect(() => {
        fetchJobs();
    }, [filter, sortOrder]);

    // --- API Functions ---

    // [GET] Fetch all jobs
    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs', {
                params: {
                    status: filter,
                    sort: sortOrder
                }
            });
            setJobs(response.data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        }
    };

    // [POST] Create a new job
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newJob = { customerName, racketType, stringType, tension, dueDate };
        try {
            await api.post('/jobs', newJob);
            fetchJobs(); // Refresh the list
            // Clear form
            setCustomerName('');
            setRacketType('');
            setStringType(hardcodedStringTypes[0]);
            setTension(50);
            setDueDate(new Date().toISOString().split('T')[0]);
        } catch (err) {
            console.error('Error creating job:', err);
        }
    };

    // [PUT] Update a job's status
    // --- THIS IS THE UPDATED FUNCTION ---
    const updateJobStatus = async (id, newStatus) => {
        try {
            // Send the new status in the request body
            await api.put(`/jobs/${id}`, { status: newStatus });
            fetchJobs(); // Refresh the list
        } catch (err) {
            console.error('Error updating job:', err);
        }
    };

    // [DELETE] Delete a job
    const deleteJob = async (id) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            try {
                await api.delete(`/jobs/${id}`);
                fetchJobs(); // Refresh the list
            } catch (err) {
                console.error('Error deleting job:', err);
            }
        }
    };

    // --- Render ---
    return (
        <div style={styles.appContainer}>
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>Racket Restringing IO</h1>
            </header>

            <main style={styles.mainContent}>
                {/* --- New Job Form --- */}
                <div style={styles.formContainer}>
                    <h2 style={styles.sectionTitle}>New Restringing Job</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* ... (all form inputs are the same) ... */}
                         <input
                            style={styles.input}
                            type="text"
                            placeholder="Customer Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Racket Type (e.g., Pure Aero)"
                            value={racketType}
                            onChange={(e) => setRacketType(e.target.value)}
                            required
                        />
                        <select
                            style={styles.input}
                            value={stringType}
                            onChange={(e) => setStringType(e.target.value)}
                        >
                            {hardcodedStringTypes.map(str => (
                                <option key={str} value={str}>{str}</option>
                            ))}
                        </select>
                        <div style={styles.inputRow}>
                            <label style={styles.label}>Tension (lbs):</label>
                            <input
                                style={{...styles.input, ...styles.inputSmall}}
                                type="number"
                                value={tension}
                                onChange={(e) => setTension(e.target.value)}
                                required
                            />
                        </div>
                        <div style={styles.inputRow}>
                            <label style={styles.label}>Due By:</label>
                            <input
                                style={{...styles.input, ...styles.inputSmall}}
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                        <button style={styles.submitButton} type="submit">Submit Job</button>
                    </form>
                </div>

                {/* --- Job List / Report --- */}
                <div style={styles.listContainer}>
                    <div style={styles.listHeader}>
                        <h2 style={styles.sectionTitle}>Current Jobs</h2>
                        <div style={styles.controlsContainer}>
                            <select 
                                style={styles.filterSelect}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="All">Show All</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <select 
                                style={styles.filterSelect}
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="dueDate">Sort by Due Date (Soonest)</option>
                                <option value="createdDate">Sort by Date Added (Oldest)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style={styles.jobList}>
                        {jobs.length === 0 ? (
                            <p style={styles.jobCard}>No jobs found.</p>
                        ) : (
                            // --- USE THE NEW JobCard COMPONENT ---
                            jobs.map(job => (
                                <JobCard 
                                    key={job._id} 
                                    job={job} 
                                    onUpdateStatus={updateJobStatus} 
                                    onDelete={deleteJob} 
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* --- NEW: REPORT SECTION --- */}
                {/* This will place the report in the main content area */}
                <Report />

            </main>
        </div>
    );
}


// --- Styling (CSS-in-JS) ---
// (We remove the JobCard styles since they are in JobCard.js now)
const TENNIS_GREEN = '#c4ff00';

const styles = {
    appContainer: {
        backgroundColor: '#1a1a1a',
        color: '#f0f0f0',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
    },
    header: {
        backgroundColor: '#000',
        padding: '20px',
        textAlign: 'center',
        borderBottom: `2px solid ${TENNIS_GREEN}`
    },
    headerTitle: {
        color: TENNIS_GREEN,
        margin: 0,
        fontWeight: 'bold',
        fontSize: '2.5rem'
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align items to the top
    },
    formContainer: {
        backgroundColor: '#2b2b2b',
        borderRadius: '8px',
        padding: '20px',
        flex: 1,
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    },
    listContainer: {
        flex: 2,
        minWidth: '300px',
        maxWidth: '700px', // Give it a max width
    },
    // (The new Report component will be a flex item next to these)
    sectionTitle: {
        color: TENNIS_GREEN,
        fontWeight: 'bold',
        borderBottom: '1px solid #444',
        paddingBottom: '10px',
        marginTop: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    input: {
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '4px',
        padding: '12px',
        color: '#f0f0f0',
        fontSize: '1rem',
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    inputSmall: {
        flex: 1
    },
    label: {
        color: '#ccc'
    },
    submitButton: {
        backgroundColor: TENNIS_GREEN,
        color: '#000',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '4px',
        padding: '15px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        marginTop: '10px'
    },
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap', 
        gap: '10px'
    },
    controlsContainer: {
        display: 'flex',
        gap: '10px'
    },
    filterSelect: {
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '4px',
        padding: '8px',
        color: '#f0f0f0',
        fontSize: '0.9rem'
    },
    jobList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    // Removed JobCard styles from here
};

export default App;