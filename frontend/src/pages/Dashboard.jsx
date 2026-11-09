import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReadings } from "../services/api";
import AddReading from "../components/AddReading";

function Dashboard() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your glucose tracking overview.</p>
      <button onClick={handleLogout}>Logout</button>
      <AddReading onReadingAdded={fetchReadings} />
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
