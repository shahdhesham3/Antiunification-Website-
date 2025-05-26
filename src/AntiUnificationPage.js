import React from 'react';
import PlotkinAntiUnification from './PlotkinAntiUnification';
import ImprovedAntiUnification from './ImprovedAntiUnification';

const AntiUnificationPage = () => {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', justifyContent: 'center' }}>
      <div style={{ flex: '0 0 600px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2>Plotkin's Anti-Unification</h2>
        <PlotkinAntiUnification />
      </div>
      <div style={{ flex: '0 0 600px', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2>Improved Anti-Unification</h2>
        <ImprovedAntiUnification />
      </div>
    </div>
  );
};

export default AntiUnificationPage;
