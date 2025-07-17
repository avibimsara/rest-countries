import React, { useState , useEffect} from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched]   = useState({ username: false, password: false });
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('apiKey')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Validators
  const validate = {
    username: (u) => u.trim() !== '',
    password: (p) => p.length >= 6,
  };

  const errors = {
    username: touched.username && !validate.username(username)
      ? 'Username is required.'
      : '',
    password: touched.password && !validate.password(password)
      ? 'Password is required.'
      : '',
  };

  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    if (!validate.username(username) || !validate.password(password)) {
      return;
    }
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('apiKey', res.data.apiKey);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Login</h2>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={handleBlur('username')}
                  required
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handleBlur('password')}
                  required
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              Don’t have an account?{' '}
              <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
