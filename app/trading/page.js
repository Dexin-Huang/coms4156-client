'use client';
import { useState, useEffect } from 'react';
import { addTransaction, getTransactions } from '../../lib/mockApi';

const s = {
  box: { border: '2px solid #000', padding: '30px', marginBottom: '20px' },
  input: { border: '2px solid #000', padding: '10px', fontSize: '16px', fontFamily: 'monospace', width: '120px', marginRight: '10px' },
  select: { border: '2px solid #000', padding: '10px', fontSize: '16px', fontFamily: 'monospace', width: '100px', marginRight: '10px' },
  btn: { border: '2px solid #000', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', background: '#000', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { border: '2px solid #000', padding: '10px', background: '#000', color: '#fff', textAlign: 'left' },
  td: { border: '2px solid #000', padding: '10px' },
  msg: { border: '2px solid #000', padding: '15px', marginTop: '15px', fontFamily: 'monospace' },
};

export default function Trading() {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [side, setSide] = useState('BUY');
  const [transactions, setTransactions] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const result = await getTransactions();
    if (result.ok) {
      setTransactions(result.data.transactions || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticker || !quantity || !price) {
      setMsg('ERROR: All fields required');
      return;
    }

    const result = await addTransaction(ticker.toUpperCase(), quantity, price, side);
    if (result.ok) {
      setMsg(`OK: Trade recorded - ${side} ${quantity} ${ticker.toUpperCase()} @ $${price}`);
      setTicker('');
      setQuantity('');
      setPrice('');
      loadTransactions();
    } else {
      setMsg(`ERROR: ${JSON.stringify(result.data)}`);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>TRADING</h1>

      <div style={s.box}>
        <h2 style={{ margin: '0 0 20px 0' }}>RECORD TRADE</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
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
          <button type="submit" style={s.btn}>RECORD</button>
        </form>
        {msg && <div style={s.msg}>{msg}</div>}
      </div>

      <div style={s.box}>
        <h2 style={{ margin: '0 0 20px 0' }}>TRADE HISTORY ({transactions.length})</h2>
        {transactions.length === 0 ? (
          <p>No trades recorded yet</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>TICKER</th>
                <th style={s.th}>QTY</th>
                <th style={s.th}>PRICE</th>
                <th style={s.th}>SIDE</th>
                <th style={s.th}>TIME</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={s.td}>{t.id}</td>
                  <td style={s.td}><strong>{t.ticker}</strong></td>
                  <td style={s.td}>{t.quantity}</td>
                  <td style={s.td}>${t.price.toFixed(2)}</td>
                  <td style={s.td}>
                    <span style={{ color: t.side === 'BUY' ? 'green' : 'red', fontWeight: 'bold' }}>
                      {t.side}
                    </span>
                  </td>
                  <td style={s.td}>{new Date(t.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
