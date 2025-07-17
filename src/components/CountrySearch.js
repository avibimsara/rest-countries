import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const TYPES = [
  { value: "all", label: "All Countries", needsQuery: false },
  { value: "name", label: "Name (partial)", needsQuery: true },
  { value: "fullName", label: "Full Name (exact)", needsQuery: true },
  { value: "code", label: "Country Code", needsQuery: true },
  { value: "codes", label: "List of Codes", needsQuery: true },
  { value: "currency", label: "Currency", needsQuery: true },
  { value: "demonym", label: "Demonym", needsQuery: true },
  { value: "lang", label: "Language", needsQuery: true },
  { value: "capital", label: "Capital City", needsQuery: true },
];

export default function CountrySearch() {
  const [type, setType] = useState("name");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("apiKey");
    navigate("/login");
  };

  const search = async () => {
    setError("");
    setResults([]);

    const cfg = TYPES.find((t) => t.value === type);
    if (cfg.needsQuery && !query.trim()) {
      setError("Please enter a search term.");
      return;
    }

    try {
      const params = new URLSearchParams({ type });
      if (cfg.needsQuery) params.set("q", query.trim());

      const res = await api.get(`/countries?${params.toString()}`);
      setResults(res.data.countries);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          setError("No countries found matching your criteria.");
        } else {
          setError(
            `Error ${err.response.status}: ${
              err.response.data.message || err.response.statusText
            }`
          );
        }
      } else {
        setError("Network error – please try again.");
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Search Countries</h2>
        <button className="btn btn-outline-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="searchType" className="form-label">
                Type
              </label>
              <select
                id="searchType"
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {TYPES.find((t) => t.value === type).needsQuery && (
              <div className="col-md-6">
                <label htmlFor="searchQuery" className="form-label">
                  Query
                </label>
                <input
                  id="searchQuery"
                  type="text"
                  className="form-control"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter search term"
                />
              </div>
            )}
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary" onClick={search}>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <ul className="list-group">
          {results.map((c, idx) => (
            <li key={idx} className="list-group-item">
              <div className="d-flex align-items-center">
                <img
                  src={c.flag}
                  alt={`Flag of ${c.name}`}
                  width={48}
                  className="me-3 border"
                />
                <div>
                  <h5 className="mb-1">{c.name}</h5>
                  <p className="mb-1">
                    <strong>Capital:</strong> {c.capital || "N/A"}
                  </p>
                  <p className="mb-1">
                    <strong>Currency:</strong> {c.currencies}
                  </p>
                  <p className="mb-0">
                    <strong>Languages:</strong> {c.languages}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && !error && (
        <p className="text-center text-muted">No results to display.</p>
      )}
    </div>
  );
}
