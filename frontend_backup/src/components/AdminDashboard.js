import React, { useState } from 'react';
import LocationManager from './LocationManager';
import TrainManager from './TrainManager';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('locations');

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('locations')}
          style={activeTab === 'locations' ? styles.activeTab : styles.tab}
        >
          Manage Locations
        </button>
        <button
          onClick={() => setActiveTab('trains')}
          style={activeTab === 'trains' ? styles.activeTab : styles.tab}
        >
          Manage Trains
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'locations' && <LocationManager />}
        {activeTab === 'trains' && <TrainManager />}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ecf0f1',
    padding: '2rem',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '2rem',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  tab: {
    padding: '1rem 2rem',
    backgroundColor: 'white',
    border: '2px solid #3498db',
    color: '#3498db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  activeTab: {
    padding: '1rem 2rem',
    backgroundColor: '#3498db',
    border: '2px solid #3498db',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
};

export default AdminDashboard;