import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking, getAllLocations } from '../services/api';

function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const train = location.state?.train;

  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_age: '',
    passenger_gender: '',
    journey_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!train) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>No Train Selected</h2>
          <p>Please search and select a train to book.</p>
          <button onClick={() => navigate('/search')} style={styles.button}>
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bookingData = {
        train_id: train.id,
        journey_date: formData.journey_date,
        passenger_name: formData.passenger_name,
        passenger_age: parseInt(formData.passenger_age),
        passenger_gender: formData.passenger_gender,
      };

      const response = await createBooking(bookingData);
      alert(
        `Booking Successful!\nBooking Reference: ${response.data.booking_reference}\nSeat Number: ${response.data.seat_number}`
      );
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Book Your Ticket</h2>

      <div style={styles.trainInfo}>
        <h3 style={styles.trainName}>{train.train_name}</h3>
        <p style={styles.trainNumber}>Train #{train.train_number}</p>
        <div style={styles.fareBox}>
          <span style={styles.fareLabel}>Total Fare:</span>
          <span style={styles.fareAmount}>₹{train.fare}</span>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Passenger Details</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Passenger Name *</label>
            <input
              type="text"
              name="passenger_name"
              value={formData.passenger_name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter full name"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Age *</label>
              <input
                type="number"
                name="passenger_age"
                value={formData.passenger_age}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter age"
                min="1"
                max="120"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Gender *</label>
              <select
                name="passenger_gender"
                value={formData.passenger_gender}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Journey Date *</label>
            <input
              type="date"
              name="journey_date"
              value={formData.journey_date}
              onChange={handleChange}
              required
              style={styles.input}
              min={minDate}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/search')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Booking...' : `Pay ₹${train.fare} & Confirm`}
            </button>
          </div>
        </form>
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
  trainInfo: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto 2rem',
    textAlign: 'center',
  },
  trainName: {
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
  },
  trainNumber: {
    color: '#7f8c8d',
    margin: '0 0 1rem 0',
  },
  fareBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '4px',
  },
  fareLabel: {
    color: '#2c3e50',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  fareAmount: {
    color: '#27ae60',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    maxWidth: '600px',
    margin: '0 auto 1rem',
  },
  errorCard: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  cardTitle: {
    color: '#2c3e50',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: '0.75rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  button: {
    padding: '0.75rem 2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
    marginTop: '1rem',
  },
};

export default BookingForm;