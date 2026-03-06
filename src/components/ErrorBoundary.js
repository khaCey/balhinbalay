import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" style={{
          padding: 24,
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>Something went wrong.</p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              cursor: 'pointer',
              backgroundColor: 'var(--bb-primary, #0d6b5c)',
              color: '#fff',
              border: 'none',
              borderRadius: 6
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
