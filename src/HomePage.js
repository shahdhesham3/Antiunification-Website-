import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'; // Ensure you have this CSS file

const HomePage = () => {

    return (
        <div className="home-container">
            <h1 className="home-heading">Welcome to the Anti-Unification Tool</h1>
            <p className="home-paragraph">
                Explore the comparison between Plotkin's algorithm and advanced generalization techniques.
            </p>

            <Link to="/pattern-finder" className="home-link">
                <button className="home-button primary">Let's Play Pattern Finder</button>
            </Link>

            <Link to="/advanced-generalization" className="home-link">
                <button className="home-button secondary">Go to Anti-Unification Comparison</button>
            </Link>
        </div>
    );
};

export default HomePage;
