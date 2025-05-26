// PlotkinAntiUnification.js
import React, { useState } from 'react';

function PlotkinAntiUnification() {
    const [expression1, setExpression1] = useState('');
    const [expression2, setExpression2] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/plotkin-generalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    expression1,
                    expression2,
                    logic_type: 'first-order',
                }),
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
            <h1>Plotkin Anti-Unification</h1>
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
                <button type="submit">Generalize</button>
            </form>
            {result && (
                <div>
                    <h2>Result:</h2>
                    <pre>{JSON.stringify(result.generalization, null, 2)}</pre>
                    <p>{result.message}</p>
                    {console.log('API Response:', result)}
                </div>
            )}
            {true && (
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
            )}
        </div>
    );
}

export default PlotkinAntiUnification;
