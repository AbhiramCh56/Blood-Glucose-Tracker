import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReadings, deleteReading } from "../services/api";
import AddReading from "../components/AddReading";
import EditReading from "../components/EditReading";

function Dashboard() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReading, setSelectedReading] = useState(null);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Calling getReadings API");
      const response = await getReadings();
      console.log("API response:", response);

      setReadings(response.readings);
    } catch (error) {
      console.error("Fetching readings failed:", error);
      setError(error.message);
    } finally {
      console.log("Fetching completed");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Dashboard mounted");
    fetchReadings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this glucose reading?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteReading(id);

      setSelectedReading(null);
      fetchReadings();
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your glucose tracking overview.</p>
      <button onClick={handleLogout}>Logout</button>
      <AddReading onReadingAdded={fetchReadings} />
      {selectedReading && (
        <EditReading
          key={selectedReading.id}
          reading={selectedReading}
          onReadingUpdated={() => {
            setSelectedReading(null);
            fetchReadings();
          }}
        />
      )}
      <h2>Your glucose Readings</h2>
      {loading && <p>Loading readings...</p>}

      {error && <p className="form-error">{error}</p>}

      {!loading && !error && readings.length === 0 && (
        <p>No glucose readings found. Start by adding your first reading!</p>
      )}

      {!loading && readings.length > 0 && (
        <div>
          {readings.map((reading) => (
            <div key={reading.id}>
              <p>Date: {reading.reading_date}</p>
              <p>Slot: {reading.slot}</p>
              <p>Glucose: {reading.glucose_value} mg/dL</p>

              <button onClick={() => setSelectedReading(reading)}>Edit</button>
              <button onClick={() => handleDelete(reading.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
