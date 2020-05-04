import React, { useEffect, useState, useCallback } from 'react';

export function LiberapayWidget({ project, updateInterval = 1200000 }) {
  const [{ receiving, goal }, setData] = useState({
    receiving: '--.--',
    goal: '--.--',
  });

  const update = useCallback(async () => {
    const result = await loadLiberapayData(project);

    if (!result.receiving) {
      throw new Error('Invalid response format');
    }

    setData({
      receiving: formatSum(result.receiving),
      goal: formatSum(result.goal),
    });
  }, [project]);

  useEffect(() => {
    update();
    const t = setInterval(update, updateInterval);
    return () => clearInterval(t);
  }, [update, updateInterval]);

  return (
    <a href={`https://liberapay.com/${project}/donate`} target="_blank" rel="noopener noreferrer"
      style={{ border: '2px solid #f6c915', borderRadius: '5px', color: '#1a171b', background: 'white', display: 'inline-block', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: '14px', maxWidth: '150px', minWidth: '110px', position: 'relative', textAlign: 'center', textDecoration: 'none' }}>
      <span style={{ backgroundColor: '#f6c915', display: 'block', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontStyle: 'italic', fontWeight: 700, padding: '3px 7px 5px' }}>
        <img
          src="https://liberapay.com/assets/liberapay/icon-v2_black.svg"
          height="20"
          width="20"
          style={{ verticalAlign: 'middle' }}
          alt={project}
        />
        <span style={{ verticalAlign: 'middle' }}>LiberaPay</span>
      </span>
      <span style={{ display: 'block', padding: '5px 15px 2px' }}>
        <span style={{ color: '#f6c915', position: 'absolute', left: '-2px' }}>&#10132;</span>
        We receive <br/>
        <span style={{ fontSize: '125%' }}>{receiving}</span>
        <br/> per week,
        <br/> our goal is <br/>
        <span style={{ fontSize: '125%' }}>{goal}</span>
      </span>
    </a>
  );
}

async function loadLiberapayData(project) {
  const req = await fetch(`https://liberapay.com/${project}/public.json`, { cache: 'reload' });
  return req.json();
}

function formatSum({ amount, currency }) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount);
}
