'use client';

import { useState, useEffect } from 'react';
import { getPrediction } from '../../lib/api';

const s = {
  box: { border: '4px solid #000', padding: '30px', marginBottom: '20px' },
  input: { border: '3px solid #000', padding: '10px', fontSize: '14px', fontFamily: 'monospace', width: '100%', marginBottom: '15px' },
  btn: { border: '3px solid #000', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', background: '#000', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' },
  msg: { border: '3px solid #000', padding: '15px', marginTop: '15px', fontFamily: 'monospace', fontSize: '14px' },
  big: { fontSize: '48px', fontWeight: 'bold', margin: '10px 0' },
}

export default function Predictions() {
  const [appName, setAppName] = useState('');
  const [ticker, setTicker] = useState('');
  const [pred, setPred] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('appName');
    if (stored) setAppName(stored);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appName) return setMsg('ERROR: Register first');
    if (!ticker.trim()) return setMsg('ERROR: Ticker required');

    setLoading(true);
    setMsg('');
    setPred(null);

    const r = await getPrediction(ticker.toUpperCase());
    setLoading(false);

    if (r.ok) {
      setPred(r.data);
    } else if (r.status === 404) {
      setMsg(`ERROR: No data for ${ticker.toUpperCase()}`);
    } else {
      setMsg(`ERROR: ${JSON.stringify(r.data)}`);
    }
  };

  if (!appName) {
    return (
      <div style={s.box}>
        <strong>ERROR: Register app first at <a href="/">HOME</a></strong>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '36px', margin: '0 0 20px 0' }}>PREDICTIONS</h1>
      <p style={{ margin: '0 0 20px 0', fontFamily: 'monospace' }}>LOGGED IN: {appName}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={s.box}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>GET PREDICTION</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="TICKER (e.g., AAPL)"
              style={s.input}
            />
            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? 'LOADING...' : 'PREDICT'}
            </button>
          </form>
          {msg && <div style={s.msg}>{msg}</div>}
        </div>

        <div style={s.box}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>RESULT</h2>
          {pred ? (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>{pred.ticker}</div>
                <div style={{ fontSize: '14px' }}>PROBABILITY UP</div>
                <div style={s.big}>{(pred.prob_up * 100).toFixed(1)}%</div>
                <div style={{ height: '30px', border: '3px solid #000', background: pred.prob_up >= 0.5 ? '#000' : '#fff', width: `${pred.prob_up * 100}%` }} />
              </div>

              <div>
                <div style={{ fontSize: '14px' }}>SIGNAL STRENGTH</div>
                <div style={s.big}>{(pred.strength * 100).toFixed(1)}%</div>
                <div style={{ height: '30px', border: '3px solid #000', background: '#000', width: `${pred.strength * 100}%` }} />
              </div>

              <div style={{ ...s.msg, marginTop: '20px' }}>
                {pred.prob_up >= 0.5 ? '▲ BULLISH' : '▼ BEARISH'} / {pred.strength >= 0.5 ? 'STRONG' : 'WEAK'}
              </div>
            </div>
          ) : (
            <p>Enter ticker to get prediction.</p>
          )}
        </div>
      </div>

      <div style={s.box}>
        <h3 style={{ margin: '0 0 10px 0' }}>ABOUT</h3>
        <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px' }}>
          Uses EWMA analysis. Try: AAPL, GOOGL, MSFT, TSLA, AMZN
        </p>
      </div>
    </div>
  );
}
