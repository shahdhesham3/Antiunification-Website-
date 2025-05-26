import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage'; // your original first page
import AdvancedGeneralization from './AdvancedGeneralization'; // your Plotkin comparison page
import AntiUnificationPage from './AntiUnificationPage';
import PatternFinderGame from './PatternFinderGame'; // Import the new component


class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children; 
    }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/advanced-generalization" element={<AdvancedGeneralization />} />
          <Route path="/anti-unification" element={<AntiUnificationPage />} />
          <Route path="/pattern-finder" element={<PatternFinderGame />} /> {/* Add this route */}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
