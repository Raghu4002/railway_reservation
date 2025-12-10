import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLocations, searchTrains } from '../services/api';

function TrainSearch() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [searchParams, setSearchParams] = useState({
    source_id: '',
    destination_id: '',
  });
  const [trains, setTrains] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await getAllLocations();
      setLocations(response.data);
    } catch (err) {
      setError('Failed to fetch locations');
    }
  };

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const params = {};
      if (searchParams.source_id) params.source_id = parseInt(searchParams.source_id);
      if (searchParams.destination_id) params.destination_id = parseInt(searchParams.destination_id);

      const response = await searchTrains(params);
      setTrains(response.data);
    } catch (err) {
      setError('Failed to search trains');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrain = (train) => {
    navigate('/book', { state: { train } });
  };

  const getLocationName = (id) => {
    const location = locations.find((loc) => loc.id === id);
    return location ? `${location.name} (${location.code})` : 'Unknown';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Search Trains</h2>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>From (Source)</label>
              <select
                name="source_id"
                value={searchParams.source_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">All Stations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>To (Destination)</label>
              <select
                name="destination_id"
                value={searchParams.destination_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">All Stations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Searching...' : '🔍 Search Trains'}
          </button>
        </form>
      </div>

      {searched && (
        <div style={styles.resultsCard}>
          <h3 style={styles.resultsTitle}>
            {trains.length} Train(s) Found
          </h3>

          {trains.length === 0 ? (
            <p style={styles.noData}>
              No trains found for the selected route. Try different stations.
            </p>
          ) : (
            <div style={styles.trainList}>
              {trains.map((train) => (
                <div key={train.id} style={styles.trainCard}>
                  <div style={styles.trainHeader}>
                    <div>
                      <h4 style={styles.trainName}>{train.train_name}</h4>
                      <p style={styles.trainNumber}>#{train.train_number}</p>
                    </div>
                    <div style={styles.fareBox}>
                      <span style={styles.fareLabel}>Fare</span>
                      <span style={styles.fareAmount}>₹{train.fare}</span>
                    </div>
                  </div>

                  <div style={styles.trainDetails}>
                    <div style={styles.routeInfo}>
                      <div style={styles.station}>
                        <span style={styles.stationName}>
                          {getLocationName(train.source_id)}
                        </span>
                        <span style={styles.time}>{train.departure_time}</span>
                      </div>
                      <div style={styles.arrow}>→</div>
                      <div style={styles.station}>
                        <span style={styles.stationName}>
                          {getLocationName(train.destination_id)}
                        </span>
                        <span style={styles.time}>{train.arrival_time}</span>
                      </div>
                    </div>

                    <div style={styles.seatsInfo}>
                      <span style={styles.seatsLabel}>Available Seats:</span>
                      <span
                        style={
                          train.available_seats > 0
                            ? styles.seatsAvailable
                            : styles.seatsUnavailable
                        }
                      >
                        {train.available_seats}/{train.total_seats}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookTrain(train)}
                    disabled={train.available_seats === 0}
                    style={
                      train.available_seats > 0
                        ? styles.bookButton
                        : styles.bookButtonDisabled
                    }
                  >
                    {train.available_seats > 0 ? 'Book Now' : 'Sold Out'}
                  </button>
                </div>
              ))}
            </div>
          )}
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
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    maxWidth: '800px',
    margin: '0 auto 1rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto 2rem',
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
  button: {
    padding: '1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  resultsCard: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  resultsTitle: {
    color: '#2c3e50',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    padding: '3rem',
    color: '#7f8c8d',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  trainList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  trainCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  trainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #ecf0f1',
  },
  trainName: {
    color: '#2c3e50',
    margin: '0 0 0.25rem 0',
    fontSize: '1.3rem',
  },
  trainNumber: {
    color: '#7f8c8d',
    margin: 0,
    fontSize: '0.9rem',
  },
  fareBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  fareLabel: {
    color: '#7f8c8d',
    fontSize: '0.85rem',
  },
  fareAmount: {
    color: '#27ae60',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  trainDetails: {
    marginBottom: '1rem',
  },
  routeInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  station: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  stationName: {
    color: '#2c3e50',
    fontWeight: '500',
    fontSize: '1rem',
  },
  time: {
    color: '#3498db',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginTop: '0.25rem',
  },
  arrow: {
    color: '#7f8c8d',
    fontSize: '1.5rem',
    margin: '0 1rem',
  },
  seatsInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#ecf0f1',
    borderRadius: '4px',
  },
  seatsLabel: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  seatsAvailable: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  seatsUnavailable: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  },
  bookButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  bookButtonDisabled: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'not-allowed',
    fontWeight: '500',
  },
};

export default TrainSearch;