import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminLayout from './AdminLayout.tsx';
import './index.css';
import React from 'react';

// Global fetch interceptor to inject JWT token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = typeof resource === 'string' ? resource : resource instanceof Request ? resource.url : '';
  
  if (url.startsWith('/api/') && !url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
    const token = localStorage.getItem('tycoon_token');
    if (token) {
      const newConfig: any = config || {};
      newConfig.headers = {
        ...newConfig.headers,
        Authorization: `Bearer ${token}`
      };
      return originalFetch(resource, newConfig);
    }
  }
  return originalFetch(...args);
};

class ErrorBoundary extends React.Component<{children: any}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h2>React Crash!</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children; 
  }
}

const path = window.location.pathname;
const MainComponent = path.startsWith('/admin') ? <AdminLayout onBack={() => window.location.href = '/'} /> : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {MainComponent}
    </ErrorBoundary>
  </StrictMode>,
);
