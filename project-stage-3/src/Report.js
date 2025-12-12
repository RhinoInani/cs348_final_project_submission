// File: src/Report.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API instance (must match App.js)
const api = axios.create({
    baseURL: 'https://api-rg3xpnythq-uc.a.run.app/api',
});


// Styles
const TENNIS_GREEN = '#c4ff00';
const styles = {
    reportContainer: {
        backgroundColor: '#2b2b2b',
        borderRadius: '8px',
        padding: '20px',
        flex: 1, // Make it take up space
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        color: '#f0f0f0',
    },
    // --- NEW: Header style for Title + Button ---
    reportHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #444',
        paddingBottom: '10px',
    },
    sectionTitle: {
        color: TENNIS_GREEN,
        fontWeight: 'bold',
        margin: 0,
    },
    // --- NEW: Refresh Button Style ---
    refreshButton: {
        backgroundColor: TENNIS_GREEN,
        color: '#000',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 14px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    refreshButtonDisabled: {
        backgroundColor: '#555',
        color: '#999',
        cursor: 'not-allowed',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        margin: '20px 0',
    },
    statBox: {
        backgroundColor: '#333',
        padding: '15px',
        borderRadius: '6px',
        textAlign: 'center',
    },
    statValue: {
        color: TENNIS_GREEN,
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: '0 0 5px 0',
    },
    statLabel: {
        color: '#ccc',
        fontSize: '0.9rem',
    },
    filtersContainer: {
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        color: '#ccc',
        fontSize: '0.9rem',
    },
    input: {
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '4px',
        padding: '8px',
        color: '#f0f0f0',
        width: '100px',
    },
    jobRow: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        padding: '10px',
        borderBottom: '1px solid #444',
        fontSize: '0.9rem',
    },
    jobRowHeader: {
        fontWeight: 'bold',
        color: TENNIS_GREEN,
    }
};


const Report = () => {
    const [stats, setStats] = useState(null);
    const [reportJobs, setReportJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    
    // --- NEW: Loading state for refresh button ---
    const [isLoading, setIsLoading] = useState(false);
    
    // --- Filter State ---
    const [maxHoursSitting, setMaxHoursSitting] = useState('');
    const [maxHoursToComplete, setMaxHoursToComplete] = useState('');

    // --- NEW: Extracted fetch function ---
    // We put the API call in its own function so we can call it
    // from useEffect OR the button.
    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/report');
            setStats(response.data.stats);
            setReportJobs(response.data.jobs);
            // setFilteredJobs(response.data.jobs); // No need, the effect below handles this
        } catch (err) {
            console.error("Error fetching report:", err);
        }
        setIsLoading(false);
    };

    // useEffect for initial load
    useEffect(() => {
        fetchReportData();
    }, []); // Runs only once on mount

    // Effect to re-run filtering when jobs or filters change
    useEffect(() => {
        let jobs = [...reportJobs];

        if (maxHoursSitting !== '') {
            jobs = jobs.filter(job => job.hoursSitting <= parseFloat(maxHoursSitting));
        }

        if (maxHoursToComplete !== '') {
            jobs = jobs.filter(job => job.hoursToComplete <= parseFloat(maxHoursToComplete));
        }
        
        setFilteredJobs(jobs);

    }, [reportJobs, maxHoursSitting, maxHoursToComplete]);


    if (!stats && !isLoading) {
        return (
            <div style={styles.reportContainer}>
                <div style={styles.reportHeader}>
                    <h2 style={styles.sectionTitle}>Completed Job Report</h2>
                    <button onClick={fetchReportData} style={styles.refreshButton}>
                        Refresh
                    </button>
                </div>
                <p style={{padding: '20px 0'}}>No completed job data found. Complete some jobs and refresh!</p>
            </div>
        );
    }

    if (isLoading && !stats) {
         return <div style={styles.reportContainer}>Loading report...</div>;
    }

    return (
        <div style={styles.reportContainer}>
            {/* --- UPDATED: Header with Refresh Button --- */}
            <div style={styles.reportHeader}>
                <h2 style={styles.sectionTitle}>Completed Job Report</h2>
                <button 
                    onClick={fetchReportData} 
                    disabled={isLoading}
                    style={{...styles.refreshButton, ...(isLoading && styles.refreshButtonDisabled)}}
                >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            
            {/* --- Stats Section (Labels Updated) --- */}
            <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                    <p style={styles.statValue}>{stats.avgHoursToComplete} hrs</p>
                    <p style={styles.statLabel}>Avg. Completion Time</p>
                </div>
                <div style={styles.statBox}>
                    <p style={styles.statValue}>{stats.avgHoursSitting} hrs</p>
                    <p style={styles.statLabel}>Avg. Pending Time</p>
                </div>
                <div style={styles.statBox}>
                    <p style={styles.statValue}>{stats.mostPopularString}</p>
                    <p style={styles.statLabel}>Most Popular String</p>
                </div>
                <div style={styles.statBox}>
                    <p style={styles.statValue}>{stats.totalJobs}</p>
                    <p style={styles.statLabel}>Total Jobs Completed</p>
                </div>
            </div>

            {/* --- Filters Section (Labels Updated) --- */}
            <h3 style={{...styles.sectionTitle, fontSize: '1.2rem', border: 'none'}}>Filter Report</h3>
            <div style={styles.filtersContainer}>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Max. Pending Time (hrs)</label>
                    <input
                        style={styles.input}
                        type="number"
                        min="0"
                        value={maxHoursSitting}
                        onChange={(e) => setMaxHoursSitting(e.target.value)}
                        placeholder="e.g., 24"
                    />
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>Max. Work Time (hrs)</label>
                    <input
                        style={styles.input}
                        type="number"
                        min="0"
                        value={maxHoursToComplete}
                        onChange={(e) => setMaxHoursToComplete(e.target.value)}
                        placeholder="e.g., 3"
                    />
                </div>
            </div>

            {/* --- Filtered List Section (Labels Updated) --- */}
            <div style={{...styles.jobRow, ...styles.jobRowHeader}}>
                <span>Customer / Racket</span>
                <span>Pending Time (hrs)</span>
                <span>Work Time (hrs)</span>
                <span>String Type</span>
            </div>
            {filteredJobs.length === 0 ? (
                <p style={{padding: '10px'}}>No completed jobs match your filters.</p>
            ) : (
                filteredJobs.map(job => (
                    <div key={job._id} style={styles.jobRow}>
                        <span><strong>{job.customerName}</strong> / {job.racketType}</span>
                        <span>{job.hoursSitting}</span>
                        <span>{job.hoursToComplete}</span>
                        <span>{job.stringType}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default Report;