import React, { useState } from 'react';
import './ImprovedAntiUnification.css'; // Optional: Add styles for the light bulb and modal

function ImprovedAntiUnification() {
    const [expression1, setExpression1] = useState('');
    const [expression2, setExpression2] = useState('');
    const [logicType, setLogicType] = useState('first-order');
    const [generalizationResult, setGeneralizationResult] = useState(null); // Changed state name for clarity
    const [mappings, setMappings] = useState(null); // New state for mappings
    const [message, setMessage] = useState(''); // New state for message
    const [error, setError] = useState(null); // New state for error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralizationResult(null); // Clear previous results
        setMappings(null);
        setMessage('');
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:5000/improved-generalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    expression1,
                    expression2,
                    logic_type: logicType,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                // Assuming `data` is now an array: [generalizationString, mappingsObject]
                // OR a complex object if error/message is present
                if (Array.isArray(data)) {
                    setGeneralizationResult(data[0]); // First element is the generalization string
                    setMappings(data[1]);           // Second element is the mappings object
                    setMessage("Generalization successful!"); // Default success message
                } else if (data.generalization && data.message) { // Handle case where it's a direct object result from backend
                    setGeneralizationResult(data.generalization);
                    setMappings(data.mappings || null); // Mappings might be optional
                    setMessage(data.message);
                } else if (data.error) {
                    setError(data); // If the backend returns an error object directly
                } else {
                    setError({ error: "Unexpected response format from backend." });
                }
            } else {
                setError(data); // Backend returned an error status (e.g., 400)
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError({ error: `Failed to connect to the server: ${err.message}` });
        }
    };

    return (
        <div>
            <h1>Improved Anti-Unification</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Expression 1"
                    value={expression1}
                    onChange={(e) => setExpression1(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Expression 2"
                    value={expression2}
                    onChange={(e) => setExpression2(e.target.value)}
                />
                <select value={logicType} onChange={(e) => setLogicType(e.target.value)}>
                    <option value="first-order">First-Order Logic</option>
                    <option value="second-order">Second-Order Logic</option>
                </select>
                <button type="submit">Generalize</button>
            </form>

            {(generalizationResult || mappings || message || error) && (
                <div>
                    <h2>Result:</h2>
                    {generalizationResult && (
                        <p><strong>Generalization:</strong> {generalizationResult}</p>
                    )}
                    {message && <p>{message}</p>}

                    {/* Display Mappings in a Table if they exist and are not empty */}
                    {mappings && Object.keys(mappings).length > 0 && (
                        <div>
                            <h3>Variable Mappings:</h3>
                            <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ccc' }}>
                                        <th style={{ padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Generalized Variable</th>
                                        <th style={{ padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Original Term 1</th>
                                        <th style={{ padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Original Term 2</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(mappings).map(([genVar, originalTerms]) => (
                                        <tr key={genVar} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px' }}>{genVar}</td>
                                            <td style={{ padding: '8px' }}>{originalTerms[0]}</td>
                                            <td style={{ padding: '8px' }}>{originalTerms[1]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Display error if present */}
                    {error && (
                        <div style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '5px' }}>
                            <h3>Error:</h3>
                            <p>{error.error || "An unknown error occurred."}</p>
                            {error.limitations && (
                                <ul>
                                    {error.limitations.map((lim, index) => (
                                        <li key={index}>{lim}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
            {/* Debug Light Bulb */}
            <div>
                <h2>Debugging Light Bulb:</h2>
                <button
                    className="light-bulb"
                    style={{ background: 'yellow', border: '1px solid black', padding: '5px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', marginLeft: '10px' }}
                    onClick={() => alert('Light bulb button clicked!')}
                    aria-label="Show explanation"
                >
                    💡 Debug Light Bulb
                </button>
            </div>
        </div>
    );
}

export default ImprovedAntiUnification;