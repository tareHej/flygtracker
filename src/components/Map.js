import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Define a custom icon using Unicode
const planeIcon = new L.DivIcon({
  html: '<div style="font-size: 20px; color: blue;">✈️</div>',
  className: '', // Clear default styles
});

const Map = () => {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState(null);

  const fetchFlights = async () => {
    try {
      const response = await fetch('https://opensky-network.org/api/states/all');
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      if (data.states && Array.isArray(data.states)) {
        const flightsData = data.states
          .filter((state) => state[5] !== null && state[6] !== null) // Filter out flights with null lat/lng
          .map((state) => ({
            callsign: state[1],
            latitude: state[6],
            longitude: state[5],
            altitude: state[7],
          }))
          .slice(0, 50); // Limit to 50 flights
        setFlights(flightsData);
      } else {
        throw new Error('Unexpected data format');
      }
    } catch (error) {
      console.error('Error fetching flight data:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 5000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <MapContainer center={[54.5260, 15.2551]} zoom={4} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {flights.map((flight, index) => (
        <Marker key={index} position={[flight.latitude, flight.longitude]} icon={planeIcon}>
          <Popup>
            Flight: {flight.callsign} <br /> Altitude: {flight.altitude} ft
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
