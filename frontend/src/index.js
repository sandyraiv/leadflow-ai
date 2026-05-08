import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'white', background: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui' }}>
          <h1 style={{ color: '#ef4444', fontSize: 24, marginBottom: 16 }}>⚠️ App Crashed</h1>
          <pre style={{ background: '#1e293b', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 14, lineHeight: 1.5 }}>
            {this.state.error?.toString()}
          </pre>
          <p style={{ marginTop: 20, color: '#94a3b8' }}>
            Open browser console (F12 → Console) for full details.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);