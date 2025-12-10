import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking, getAllTrains, getAllLocations } from '../services/api';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [trains, setTrains] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, trainsRes, locationsRes] = await Promise.all([
        getMyBookings(),
        getAllTrains(),
        getAllLocations(),
      ]);
      setBookings(bookingsRes.data);
      setTrains(trainsRes.data);
      setLocations(locationsRes.data);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, bookingRef) => {
    if (window.confirm(`Are you sure you want to cancel booking ${bookingRef}?`)) {
      try {
        await cancelBooking(bookingId);
        setSuccess('Booking cancelled successfully!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  };

  const getTrainDetails = (trainId) => {
    return trains.find((t) => t.id === trainId);
  };

  const getLocationName = (id) => {
    const location = locations.find((loc) => loc.id === id);
    return location ? `${location.name} (${location.code})` : 'Unknown';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return { ...styles.status, backgroundColor: '#27ae60' };
      case 'CANCELLED':
        return { ...styles.status, backgroundColor: '#e74c3c' };
      case 'PENDING':
        return { ...styles.status, backgroundColor: '#f39c12' };
      default:
        return styles.status;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Bookings</h2>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {bookings.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any bookings. Search for trains and book your journey!</p>
        </div>
      ) : (
        <div style={styles.bookingsList}>
          {bookings.map((booking) => {
            const train = getTrainDetails(booking.train_id);
            return (
              <div key={booking.id} style={styles.bookingCard}>
                <div style={styles.bookingHeader}>
                  <div>
                    <h3 style={styles.bookingRef}>
                      Booking: {booking.booking_reference}
                    </h3>
                    <span style={getStatusStyle(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                  <div style={styles.seatInfo}>
                    <span style={styles.seatLabel}>Seat</span>
                    <span style={styles.seatNumber}>{booking.seat_number}</span>
                  </div>
                </div>

                {train && (
                  <div style={styles.trainDetails}>
                    <h4 style={styles.trainName}>{train.train_name}</h4>
                    <p style={styles.trainNumber}>Train #{train.train_number}</p>
                    <div style={styles.route}>
                      <span>{getLocationName(train.source_id)}</span>
                      <span style={styles.arrow}>→</span>
                      <span>{getLocationName(train.destination_id)}</span>
                    </div>
                    <div style={styles.timing}>
                      <span>Departure: {train.departure_time}</span>
                      <span>Arrival: {train.arrival_time}</span>
                    </div>
                  </div>
                )}

                <div style={styles.passengerDetails}>
                  <h4 style={styles.sectionTitle}>Passenger Details</h4>
                  <div style={styles.detailsGrid}>
                    <div>
                      <span style={styles.detailLabel}>Name:</span>
                      <span style={styles.detailValue}>{booking.passenger_name}</span>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Age:</span>
                      <span style={styles.detailValue}>{booking.passenger_age}</span>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Gender:</span>
                      <span style={styles.detailValue}>{booking.passenger_gender}</span>
                    </div>
                    <div>
                      <span style={styles.detailLabel}>Journey Date:</span>
                      <span style={styles.detailValue}>
                        {new Date(booking.journey_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.fareSection}>
                  <span style={styles.fareLabel}>Total Fare Paid:</span>
                  <span style={styles.fareAmount}>₹{booking.total_fare}</span>
                </div>

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id, booking.booking_reference)}
                    style={styles.cancelButton}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  loading: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '1.2rem',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    maxWidth: '800px',
    margin: '0 auto 1rem',
  },
  success: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    maxWidth: '800px',
    margin: '0 auto 1rem',
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    color: '#7f8c8d',
  },
  bookingsList: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  bookingCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #ecf0f1',
  },
  bookingRef: {
    color: '#2c3e50',
    margin: '0 0 0.5rem 0',
    fontSize: '1.2rem',
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  seatInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  seatLabel: {
    color: '#7f8c8d',
    fontSize: '0.85rem',
  },
  seatNumber: {
color: '#3498db',
fontSize: '1.5rem',
fontWeight: 'bold',
},
trainDetails: {
marginBottom: '1.5rem',
paddingBottom: '1rem',
borderBottom: '1px solid #ecf0f1',
},
trainName: {
color: '#2c3e50',
margin: '0 0 0.25rem 0',
},
trainNumber: {
color: '#7f8c8d',
margin: '0 0 0.75rem 0',
fontSize: '0.9rem',
},
route: {
display: 'flex',
alignItems: 'center',
gap: '1rem',
color: '#2c3e50',
fontWeight: '500',
marginBottom: '0.5rem',
},
arrow: {
color: '#7f8c8d',
fontSize: '1.2rem',
},
timing: {
display: 'flex',
gap: '2rem',
color: '#7f8c8d',
fontSize: '0.9rem',
},
passengerDetails: {
marginBottom: '1.5rem',
},
sectionTitle: {
color: '#2c3e50',
margin: '0 0 1rem 0',
fontSize: '1rem',
},
detailsGrid: {
display: 'grid',
gridTemplateColumns: '1fr 1fr',
gap: '0.75rem',
},
detailLabel: {
color: '#7f8c8d',
fontSize: '0.9rem',
marginRight: '0.5rem',
},
detailValue: {
color: '#2c3e50',
fontWeight: '500',
},
fareSection: {
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
padding: '1rem',
backgroundColor: '#ecf0f1',
borderRadius: '4px',
marginBottom: '1rem',
},
fareLabel: {
color: '#2c3e50',
fontWeight: '500',
fontSize: '1rem',
},
fareAmount: {
color: '#27ae60',
fontSize: '1.5rem',
fontWeight: 'bold',
},
cancelButton: {
width: '100%',
padding: '0.75rem',
backgroundColor: '#e74c3c',
color: 'white',
border: 'none',
borderRadius: '4px',
fontSize: '1rem',
cursor: 'pointer',
fontWeight: '500',
},
};
export default MyBookings;