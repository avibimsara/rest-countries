import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Welcome!</h2>
          <p className="mb-4">Please choose an option:</p>
          <div className="d-grid gap-3">
            <Link to="/search" className="btn btn-primary btn-lg">
              Search Countries
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              Manage API Keys
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
