import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

// helper to mask a key: show first/last 4 chars
const maskKey = (key) =>
  key.length > 8 ? `${key.slice(0, 4)}…${key.slice(-4)}` : key;

// format ISO timestamp
const fmt = (ts) => (ts ? new Date(ts).toLocaleString() : "—");

export default function Dashboard() {
  const [keys, setKeys] = useState([]);
  const [selectedKeyForLogs, setSelectedKeyForLogs] = useState(null);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await api.get("/keys");
      setKeys(res.data.keys);
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    }
  };

  const createKey = async () => {
    try {
      const res = await api.post("/keys");
      // show the raw key once
      alert(`New key: ${res.data.key}`);
      fetchKeys();
    } catch (err) {
      console.error("Failed to create key:", err);
    }
  };

  const showLogs = async (keyId) => {
    try {
      const res = await api.get(`/keys/${keyId}/logs`);
      setLogs(res.data.logs);
      setSelectedKeyForLogs(keyId);
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("apiKey");
    navigate("/login");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">API Key Management</h2>
        <div>
          <button className="btn btn-success me-2" onClick={createKey}>
            Generate New Key
          </button>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="table-responsive mb-4">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Key</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>{k.id}</td>
                <td>
                  <code>{maskKey(k.key)}</code>
                </td>
                <td>{fmt(k.created_at)}</td>
                <td>{fmt(k.last_used)}</td>
                <td>{k.usage_count}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => showLogs(k.id)}
                  >
                    View Logs
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedKeyForLogs && (
        <div className="card mb-4">
          <div className="card-header">
            Usage Logs for Key {selectedKeyForLogs}
          </div>
          <ul className="list-group list-group-flush">
            {logs.length > 0 ? (
              logs.map((l, idx) => (
                <li key={idx} className="list-group-item">
                  <span className="text-secondary me-3">
                    {new Date(l.timestamp).toLocaleString()}
                  </span>
                  <code>{l.endpoint}</code>
                </li>
              ))
            ) : (
              <li className="list-group-item text-center text-muted">
                No usage yet.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
