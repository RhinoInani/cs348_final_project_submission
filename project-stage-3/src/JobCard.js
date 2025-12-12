// File: src/JobCard.js
import React from 'react';

// --- (Import the styles from App.js or move them here) ---
// For simplicity, I'll just re-declare the styles it needs
const TENNIS_GREEN = '#c4ff00';
const styles = {
     jobCard: {
        backgroundColor: '#2b2b2b',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    },
    jobCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    jobName: {
        color: '#f0f0f0',
        margin: 0,
        fontSize: '1.2rem',
    },
    jobRacket: {
        color: TENNIS_GREEN,
        fontWeight: 'normal',
        fontSize: '1rem',
    },
    jobStatus: {
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    jobDetail: {
        margin: '5px 0',
        color: '#ccc',
    },
    jobActions: {
        borderTop: '1px solid #444',
        paddingTop: '15px',
        marginTop: '15px',
        display: 'flex',
        gap: '10px'
    },
    actionButton: {
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    updateButton: {
        backgroundColor: '#4a69bd',
        color: 'white',
    },
    deleteButton: {
        backgroundColor: '#c94c4c',
        color: 'white',
    },
    completeButton: {
        backgroundColor: '#5a995a',
        color: 'white',
    },
    disabledButton: {
        backgroundColor: '#555',
        color: '#999',
        cursor: 'not-allowed'
    }
};

const JobCard = ({ job, onUpdateStatus, onDelete }) => {
    
    const getStatusColor = (status) => {
        if (status === 'Completed') return '#5a995a';
        if (status === 'In Progress') return '#e8ad02';
        return '#c94c4c';
    };

    // --- NEW: RENDER STATUS BUTTON LOGIC ---
    const renderStatusButton = () => {
        if (job.status === 'Pending') {
            return (
                <button 
                    style={{...styles.actionButton, ...styles.updateButton}}
                    onClick={() => onUpdateStatus(job._id, 'In Progress')}
                >
                    Start Job
                </button>
            );
        }
        if (job.status === 'In Progress') {
            return (
                <button 
                    style={{...styles.actionButton, ...styles.completeButton}}
                    onClick={() => onUpdateStatus(job._id, 'Completed')}
                >
                    Complete Job
                </button>
            );
        }
        if (job.status === 'Completed') {
            return (
                <button 
                    style={{...styles.actionButton, ...styles.disabledButton}}
                    disabled
                >
                    Completed
                </button>
            );
        }
        return null; // Don't show button for "Cancelled" etc.
    };

    return (
        <div style={styles.jobCard}>
            <div style={styles.jobCardHeader}>
                <h3 style={styles.jobName}>{job.customerName} - <span style={styles.jobRacket}>{job.racketType}</span></h3>
                <span style={{ ...styles.jobStatus, backgroundColor: getStatusColor(job.status) }}>
                    {job.status}
                </span>
            </div>
            <p style={styles.jobDetail}><strong>String:</strong> {job.stringType}</p>
            <p style={styles.jobDetail}><strong>Tension:</strong> {job.tension} lbs</p>
            <p style={styles.jobDetail}><strong>Due Date:</strong> {new Date(job.dueDate).toLocaleDateString()}</p>
            <div style={styles.jobActions}>
                {/* Use the new render function */}
                {renderStatusButton()}
                
                <button 
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onClick={() => onDelete(job._id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default JobCard;