import React, { useState, useEffect } from 'react';
import { createTrain, getAllTrains, getAllLocations, deleteTrain } from '../services/api';

function TrainManager() {
  const [trains, setTrains] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    train_number: '',
    train_name: '',
    source_id: '',
    destination_id: '',
    departure_time: '',
    arrival_time: '',
    total_seats: '',
    fare: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrains();
    fetchLocations();
  }, []);

  const fetchTrains = async () => {
    try {
      const response = await getAllTrains();
      setTrains(response.data);
    } catch (err) {
      setError('Failed to fetch trains');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await getAllLocations();
      setLocations(response.data);
    } catch (err) {
      setError('Failed to fetch locations');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const trainData = {
        ...formData,
        source_id: parseInt(formData.source_id),
        destination_id: parseInt(formData.destination_id),
        total_seats: parseInt(formData.total_seats),
        fare: parseInt(formData.fare),
      };
      await createTrain(trainData);
      setSuccess('Train added successfully!');
      setFormData({
        train_number: '',
        train_name: '',
        source_id: '',
        destination_id: '',
        departure_time: '',
        arrival_time: '',
        total_seats: '',
        fare: '',
      });
      fetchTrains();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add train');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await deleteTrain(id);
        setSuccess('Train deleted successfully!');
        fetchTrains();
      } catch (err) {
        setError('Failed to delete train');
      }
    }
  };

  const getLocationName = (id) => {
    const location = locations.find((loc) => loc.id === id);
    return location ? `${location.name} (${location.code})` : 'Unknown';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Train Management</h2>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Add New Train</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Train Number</label>
              <input
                type="text"
                name="train_number"
                value={formData.train_number}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="e.g., 12345"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Train Name</label>
              <input
                type="text"
                name="train_name"
                value={formData.train_name}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="e.g., Shatabdi Express"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Source Station</label>
              <select
                name="source_id"
                value={formData.source_id}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select Source</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Destination Station</label>
              <select
                name="destination_id"
                value={formData.destination_id}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select Destination</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Departure Time</label>
              <input
                type="time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Arrival Time</label>
              <input
                type="time"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Seats</label>
              <input
                type="number"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="e.g., 100"
                min="1"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Fare (₹)</label>
              <input
                type="number"
                name="fare"
                value={formData.fare}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="e.g., 500"
                min="1"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Adding...' : 'Add Train'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>All Trains</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Train Number</th>
                <th style={styles.th}>Train Name</th>
                <th style={styles.th}>Route</th>
                <th style={styles.th}>Timing</th>
                <th style={styles.th}>Seats</th>
                <th style={styles.th}>Fare</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((train) => (
                <tr key={train.id} style={styles.tr}>
                  <td style={styles.td}>{train.train_number}</td>
                  <td style={styles.td}>{train.train_name}</td>
                  <td style={styles.td}>
                    {getLocationName(train.source_id)} → {getLocationName(train.destination_id)}
                  </td>
                  <td style={styles.td}>
                    {train.departure_time} - {train.arrival_time}
                  </td>
                  <td style={styles.td}>
                    {train.available_seats}/{train.total_seats}
                  </td>
                  <td style={styles.td}>₹{train.fare}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDelete(train.id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {trains.length === 0 && (
            <p style={styles.noData}>No trains found. Add some trains!</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '2rem',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  success: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  cardTitle: {
    color: '#2c3e50',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#34495e',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '500',
  },
  tr: {
    borderBottom: '1px solid #ecf0f1',
  },
  td: {
    padding: '1rem',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  noData: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
  },
};

export default TrainManager;