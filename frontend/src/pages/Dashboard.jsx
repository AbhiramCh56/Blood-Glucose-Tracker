import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReadings, deleteReading } from "../services/api";
import AddReading from "../components/AddReading";
import EditReading from "../components/EditReading";
import DailyReport from "../components/DailyReport";
import MonthToDateReport from "../components/MonthToDateReport";
import PreviousMonthReport from "../components/PreviousMonthReport";

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
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div>
          <h1>Sweety</h1>
          <p>Your Blood Glucose Tracker</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="dashboard-content">
        {/* Welcome Section */}
        <section className="dashboard-welcome">
          <h2>Your Dashboard</h2>
          <p>Track your glucose readings and monitor your progress.</p>
        </section>

        {/* Add Reading Section */}
        <section className="dashboard-section">
          <h2>Add a Glucose Reading</h2>

          <AddReading onReadingAdded={fetchReadings} />
        </section>

        {/* Edit Reading Section */}
        {selectedReading && (
          <section className="dashboard-section">
            <h2>Edit Glucose Reading</h2>

            <EditReading
              key={selectedReading.id}
              reading={selectedReading}
              onReadingUpdated={() => {
                setSelectedReading(null);
                fetchReadings();
              }}
            />
          </section>
        )}

        {/* Reports Section */}
        <section className="dashboard-section">
          <h2>Glucose Reports</h2>

          <div className="dashboard-report">
            <DailyReport />
          </div>

          <div className="dashboard-report">
            <MonthToDateReport />
          </div>

          <div className="dashboard-report">
            <PreviousMonthReport />
          </div>
        </section>

        {/* Reading History Section */}
        <section className="dashboard-section">
          <h2>Your Glucose Readings</h2>

          {loading && <p>Loading readings...</p>}

          {error && <p className="form-error">{error}</p>}

          {!loading && !error && readings.length === 0 && (
            <p>
              No glucose readings found. Start by adding your first reading!
            </p>
          )}

          {!loading && readings.length > 0 && (
            <div className="reading-list">
              {readings.map((reading) => (
                <div className="reading-card" key={reading.id}>
                  <div className="reading-info">
                    <p className="reading-date">{reading.reading_date}</p>

                    <p className="reading-slot">
                      {reading.slot.replaceAll("_", " ")}
                    </p>
                  </div>

                  <div className="reading-value">
                    <span>{reading.glucose_value}</span>
                    <small>mg/dL</small>
                  </div>

                  <div className="reading-actions">
                    <button onClick={() => setSelectedReading(reading)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(reading.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
