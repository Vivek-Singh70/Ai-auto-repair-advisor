import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle, Info, Send, Wrench, 
  History, Trash2, Zap, Fuel, Activity, Settings, 
  ChevronRight, Car
} from 'lucide-react';
import './App.css';

const API_URL = 'http://localhost:5000/api/diagnose';

function App() {
  const [issue, setIssue] = useState('');
  const [carType, setCarType] = useState('Petrol');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('autoRepairHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history
  const saveToHistory = (newResult, queryData) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      issue: queryData.issue,
      carType: queryData.carType,
      result: newResult
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem('autoRepairHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('autoRepairHistory');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue.trim()) {
      setError('Please describe the car issue.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(API_URL, { issue, carType });
      setResult(response.data);
      saveToHistory(response.data, { issue, carType });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setIssue(item.issue);
    setCarType(item.carType);
    setResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const carTypes = [
    { id: 'Petrol', icon: Fuel, label: 'Petrol' },
    { id: 'Diesel', icon: Activity, label: 'Diesel' },
    { id: 'Electric', icon: Zap, label: 'Electric' }
  ];

  return (
    <div className="app-container">
      <header className="header">
        <motion.div 
          className="logo-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Wrench size={32} color="white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1>AI Auto Repair Advisor</h1>
          <p>Describe your car problem, and let AI diagnose it instantly.</p>
        </motion.div>
      </header>

      <main className="main-content">
        <motion.div 
          className="glass-panel input-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><Car size={18} /> Vehicle Type</label>
              <div className="car-type-selector">
                {carTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      className={`type-btn ${carType === type.id ? 'active' : ''}`}
                      onClick={() => setCarType(type.id)}
                    >
                      <Icon size={24} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label><AlertTriangle size={18} /> Describe the Issue</label>
              <textarea
                className="textarea-input"
                placeholder="E.g., My car makes a grinding noise when I apply the brakes, and the steering wheel shakes."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
            </div>

            {error && (
              <motion.div 
                className="critical-alert" style={{ marginBottom: '1rem', padding: '0.75rem' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <AlertTriangle size={20} className="flex-shrink-0" />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !issue.trim()}
            >
              {loading ? 'Analyzing...' : 'Diagnose Problem'}
              {!loading && <Send size={20} />}
            </button>
          </form>

          {history.length > 0 && (
            <div className="history-panel">
              <div className="history-header">
                <h3><History size={18} /> Recent Queries</h3>
                <button type="button" className="clear-history-btn" onClick={clearHistory}>
                  <Trash2 size={14} /> Clear
                </button>
              </div>
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.id} className="history-item" onClick={() => loadHistoryItem(item)}>
                    <div className="history-item-header">
                      <span>{item.carType}</span>
                      <span>{item.date}</span>
                    </div>
                    <div className="history-item-issue">{item.issue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="results-panel">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                className="glass-panel loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="spinner"></div>
                <p>AI is analyzing the symptoms...</p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                className="results-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {result.isCritical && (
                  <div className="critical-alert">
                    <AlertTriangle size={28} />
                    <div>
                      <h3>Critical Safety Warning</h3>
                      <p>This issue poses a significant safety risk or could cause severe damage. Do not drive the vehicle and seek professional help immediately.</p>
                    </div>
                  </div>
                )}

                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Diagnosis Complete</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Based on the symptoms provided</p>
                  </div>
                  <div className={`difficulty-badge difficulty-${result.difficulty}`}>
                    {result.difficulty === 'Easy' && <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />}
                    {result.difficulty === 'Medium' && <Settings size={16} style={{ marginRight: '0.5rem' }} />}
                    {result.difficulty === 'Hard' && <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />}
                    Difficulty: {result.difficulty}
                  </div>
                </div>

                <div className="result-card">
                  <div className="result-card-header">
                    <Info size={20} color="var(--primary)" />
                    Possible Causes
                  </div>
                  <div className="result-card-content">
                    <ul className="result-list">
                      {result.causes.map((cause, idx) => (
                        <li key={idx}>
                          <ChevronRight size={18} className="list-icon" />
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="result-card">
                  <div className="result-card-header">
                    <Activity size={20} color="var(--warning)" />
                    Troubleshooting Steps
                  </div>
                  <div className="result-card-content">
                    <ul className="result-list">
                      {result.troubleshooting.map((step, idx) => (
                        <li key={idx}>
                          <span style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            width: '24px', height: '24px', 
                            borderRadius: '50%', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: '0.85rem', fontWeight: 'bold'
                          }}>{idx + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="result-card">
                  <div className="result-card-header">
                    <Wrench size={20} color="var(--success)" />
                    Recommended Fixes
                  </div>
                  <div className="result-card-content">
                    <ul className="result-list">
                      {result.fixes.map((fix, idx) => (
                        <li key={idx}>
                          <CheckCircle size={18} color="var(--success)" className="flex-shrink-0 mt-1" />
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                className="glass-panel empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Settings size={48} />
                <h2>Awaiting Input</h2>
                <p>Provide your car symptoms to get an AI-powered diagnosis.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
