'use client';
import { useState, useEffect } from 'react';
import { createApp, getPrediction, addTransaction } from '../lib/mockApi';

const s = {
  box: { border: '2px solid #000', padding: '30px', marginBottom: '20px' },
  input: { border: '2px solid #000', padding: '12px', fontSize: '16px', fontFamily: 'monospace', width: '150px', marginRight: '10px' },
  select: { border: '2px solid #000', padding: '12px', fontSize: '16px', fontFamily: 'monospace', width: '120px', marginRight: '10px' },
  btn: { border: '2px solid #000', padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', background: '#000', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    border: '3px solid #000',
    padding: '40px',
    maxWidth: '500px',
    textAlign: 'center',
  },
  ticker: { fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' },
  prediction: { fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' },
  details: { fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' },
  btnGroup: { display: 'flex', gap: '15px', justifyContent: 'center' },
  btnConfirm: { border: '2px solid #000', padding: '12px 30px', fontSize: '16px', fontWeight: 'bold', background: '#000', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' },
  btnCancel: { border: '2px solid #000', padding: '12px 30px', fontSize: '16px', fontWeight: 'bold', background: '#fff', color: '#000', cursor: 'pointer', fontFamily: 'monospace' },
  msg: { padding: '15px', border: '2px solid #000', marginTop: '20px', fontFamily: 'monospace' },
};

export default function Trade() {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [side, setSide] = useState('BUY');
  const [msg, setMsg] = useState('');
  const [showPrediction, setShowPrediction] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [pendingTrade, setPendingTrade] = useState(null);

  useEffect(() => {
    let instanceId = sessionStorage.getItem('instanceId');
    if (!instanceId) {
      instanceId = crypto.randomUUID().slice(0, 8);
      sessionStorage.setItem('instanceId', instanceId);
    }

    const appName = `RobinTrade-${instanceId}`;
    const storedApp = sessionStorage.getItem('appName');
    if (!storedApp || storedApp !== appName) {
      createApp(appName);
      sessionStorage.setItem('appName', appName);
    }
  }, []);

  const handleTrade = async (e) => {
    e.preventDefault();
    if (!ticker || !quantity || !price) {
      setMsg('ERROR: All fields required');
      return;
    }

    setMsg('Fetching prediction...');

    const predResult = await getPrediction(ticker.toUpperCase());
    if (predResult.ok) {
      setPrediction(predResult.data);
      setPendingTrade({ ticker: ticker.toUpperCase(), quantity, price, side });
      setShowPrediction(true);
      setMsg('');
    } else {
      setMsg(`ERROR: Could not fetch prediction for ${ticker.toUpperCase()}`);
    }
  };

  const handleConfirm = async () => {
    setShowPrediction(false);
    setMsg('Executing trade...');

    const result = await addTransaction(
      pendingTrade.ticker,
      pendingTrade.quantity,
      pendingTrade.price,
      pendingTrade.side
    );

    if (result.ok) {
      setMsg(`SUCCESS: ${pendingTrade.side} ${pendingTrade.quantity} ${pendingTrade.ticker} @ $${pendingTrade.price}`);
      setTicker('');
      setQuantity('');
      setPrice('');
    } else {
      setMsg(`ERROR: ${JSON.stringify(result.data)}`);
    }

    setPrediction(null);
    setPendingTrade(null);
  };

  const handleCancel = () => {
    setShowPrediction(false);
    setPrediction(null);
    setPendingTrade(null);
    setMsg('Trade cancelled');
  };

  const getDirection = (prob_up) => {
    if (prob_up >= 0.5) return 'BULL';
    return 'BEAR';
  };

  const getColor = (prob_up) => {
    if (prob_up >= 0.5) return '#00aa00';
    return '#aa0000';
  };

  return (
    <div>
      <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>ROBINTRADE</h1>
      <p style={{ margin: '0 0 30px 0', fontSize: '14px', opacity: 0.7 }}>Trading Platform</p>

      <div style={s.box}>
        <h2 style={{ margin: '0 0 20px 0' }}>EXECUTE TRADE</h2>
        <form onSubmit={handleTrade} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="TICKER"
            style={s.input}
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="QTY"
            style={s.input}
          />
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="PRICE"
            style={s.input}
          />
          <select value={side} onChange={(e) => setSide(e.target.value)} style={s.select}>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          <button type="submit" style={s.btn}>TRADE</button>
        </form>
        {msg && <div style={s.msg}>{msg}</div>}
      </div>

      {showPrediction && prediction && (
        <div style={s.modal} onClick={handleCancel}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.ticker}>{prediction.ticker}</div>
            <div style={{ ...s.prediction, color: getColor(prediction.prob_up) }}>
              {getDirection(prediction.prob_up)}
            </div>
            <div style={s.details}>
              Probability Up: {(prediction.prob_up * 100).toFixed(0)}%<br />
              Signal Strength: {(prediction.strength * 100).toFixed(0)}%
            </div>
            <div style={s.btnGroup}>
              <button onClick={handleConfirm} style={s.btnConfirm}>CONFIRM TRADE</button>
              <button onClick={handleCancel} style={s.btnCancel}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
