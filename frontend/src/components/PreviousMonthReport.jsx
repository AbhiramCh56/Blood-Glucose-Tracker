import { useState } from "react";
import { getPreviousMonthReport } from "../services/api";

function PreviousMonthReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      setReport(null);

      const response = await getPreviousMonthReport();

      setReport(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="report-title">Previous Month Report</h3>

      <button type="button" onClick={fetchReport} disabled={loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {loading && <p>Generating report...</p>}

      {error && <p className="form-error">{error}</p>}

      {report && (
        <div className="report-summary">
          <h3>Reporting Period</h3>
          <p>From: {report.period.startDate}</p>
          <p>To: {report.period.endDate}</p>
        </div>
      )}

      {report && (
        <div className="report-summary">
          <h3>Report Summary</h3>

          <p>Total Readings: {report.summary.totalReadings}</p>

          <p>Highest: {report.summary.highest ?? "N/A"} mg/dL</p>

          <p>Lowest: {report.summary.lowest ?? "N/A"} mg/dL</p>

          <p>Average: {report.summary.average ?? "N/A"} mg/dL</p>
        </div>
      )}

      {report && report.readings.length === 0 && (
        <p>No readings found for the previous month.</p>
      )}

      {report && report.readings.length > 0 && (
        <div className="report-summary">
          <h3>Individual Readings</h3>

          {report.readings.map((reading) => (
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

export default PreviousMonthReport;
