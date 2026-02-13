// src/components/AdherenceCharts.jsx
// This component visualises medication adherence data using charts

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Pie, Line } from "react-chartjs-2";

// Register chart.js components to enable the charts we want to use
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function AdherenceCharts({ history }) { //this receives the adherence history

  // Total doses
  const total = history.length;

  // Number of doses marked as taken
  const takenCount = history.filter((r) => r.taken).length;

  // Number of missed doses
  const missedCount = total - takenCount;

  // Percentage adherence
  const adherenceRate =
    total === 0 ? 0 : Math.round((takenCount / total) * 100);

  // PIE / BAR CHART DATA
  const takenMissedData = {
    labels: ["Taken", "Missed"],
    datasets: [
      {
        data: [takenCount, missedCount],
        backgroundColor: ["#4CAF50", "#f44336"]
      }
    ]
  };

  // LINE CHART (ADHERENCE OVER TIME)

  // Group adherence by date
  const groupedByDate = {};

  history.forEach((record) => {
    const date = new Date(record.date).toISOString().split("T")[0];

    if (!groupedByDate[date]) {
      groupedByDate[date] = { total: 0, taken: 0 };
    }

    groupedByDate[date].total += 1;
    if (record.taken) groupedByDate[date].taken += 1;
  });

  // Prepare data for line chart
  const dates = Object.keys(groupedByDate).sort();

  const adherencePercentages = dates.map((date) => {
    const { total, taken } = groupedByDate[date];
    return Math.round((taken / total) * 100);
  });

  const lineData = {
    labels: dates,
    datasets: [
      {
        label: "Daily Adherence (%)",
        data: adherencePercentages,
        borderColor: "#2196F3",
        backgroundColor: "#2196F3",
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", marginTop: "2.5rem" }}>
      <h3 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Adherence Overview
      </h3>

      {/* Summary cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div><strong>Total doses:</strong> {total}</div>
        <div><strong>Taken:</strong> {takenCount}</div>
        <div><strong>Missed:</strong> {missedCount}</div>
        <div><strong>Adherence:</strong> {adherenceRate}%</div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "2rem",
          marginTop: "2rem"
        }}
      >
        {/* Pie Chart Card: Taken vs Missed */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}
        >
          <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
            Taken vs Missed
          </h4>
          <Pie data={takenMissedData} />
        </div>

        {/* Line Chart Card: Adherence over time */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
          }}
        >
          <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
            Adherence Over Time
          </h4>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}

export default AdherenceCharts;
