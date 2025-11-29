'use client';

import { useState, useEffect } from 'react';
import { createTransaction, getTransactions } from '../../lib/api';

const s = {
  box: { border: '4px solid #000', padding: '30px', marginBottom: '20px' },
  input: { border: '3px solid #000', padding: '10px', fontSize: '14px', fontFamily: 'monospace', width: '100%', marginBottom: '10px' },
  select: { border: '3px solid #000', padding: '10px', fontSize: '14px', fontFamily: 'monospace', width: '100%', marginBottom: '10px' },
  btn: { border: '3px solid #000', padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', background: '#000', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' },
  btnWhite: { border: '3px solid #000', padding: '8px 16px', fontSize: '14px', fontWeight: 'bold', background: '#fff', color: '#000', cursor: 'pointer', fontFamily: 'monospace' },
  msg: { border: '3px solid #000', padding: '10px', marginTop: '10px', fontFamily: 'monospace', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '14px' },
  th: { border: '3px solid #000', padding: '10px', textAlign: 'left', background: '#000', color: '#fff' },
  td: { border: '3px solid #000', padding: '10px' },
}

export default function Transactions() {
  const [appName, setAppName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState('buy');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [txns, setTxns] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('appName');
    if (stored) {
      setAppName(stored);
      load();
    }
  }, []);

  const load = async () => {
    const r = await getTransactions();
    if (r.ok) setTxns(r.data.transactions || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appName) return setMsg('ERROR: Register first');
    if (!symbol || !qty || !price) return setMsg('ERROR: All fields required');

    const r = await createTransaction(symbol.toUpperCase(), side, qty, price);
    if (r.ok) {
      setMsg(`OK: Transaction ${r.data.id} created`);
      setSymbol('');
      setQty('');
      setPrice('');
      load();
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
      <h1 style={{ fontSize: '36px', margin: '0 0 20px 0' }}>TRANSACTIONS</h1>
      <p style={{ margin: '0 0 20px 0', fontFamily: 'monospace' }}>LOGGED IN: {appName}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={s.box}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>CREATE</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="SYMBOL (e.g., AAPL)" style={s.input} />
            <select value={side} onChange={(e) => setSide(e.target.value)} style={s.select}>
              <option value="buy">BUY</option>
              <option value="sell">SELL</option>
            </select>
            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="QUANTITY" step="0.000001" style={s.input} />
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="PRICE" step="0.01" style={s.input} />
            <button type="submit" style={s.btn}>CREATE</button>
          </form>
          {msg && <div style={s.msg}>{msg}</div>}
        </div>

        <div style={s.box}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>HISTORY</h2>
            <button onClick={load} style={s.btnWhite}>REFRESH</button>
          </div>

          {txns.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>SYMBOL</th>
                  <th style={s.th}>SIDE</th>
                  <th style={s.th}>QTY</th>
                  <th style={s.th}>PRICE</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id}>
                    <td style={s.td}>{t.id}</td>
                    <td style={s.td}>{t.symbol}</td>
                    <td style={s.td}>{t.side.toUpperCase()}</td>
                    <td style={s.td}>{t.qty}</td>
                    <td style={s.td}>${t.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
