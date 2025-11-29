'use client';
import { useState, useEffect } from 'react';
import { getTransactions } from '../../lib/mockApi';

const s = {
  box: { border: '2px solid #000', padding: '30px', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { border: '2px solid #000', padding: '12px', background: '#000', color: '#fff', textAlign: 'left' },
  td: { border: '2px solid #000', padding: '12px' },
  positive: { color: '#00aa00', fontWeight: 'bold' },
  negative: { color: '#aa0000', fontWeight: 'bold' },
};

export default function Portfolio() {
  const [positions, setPositions] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    const result = await getTransactions();
    if (result.ok) {
      const txns = result.data.transactions || [];
      setTransactions(txns);

      const posMap = {};
      txns.forEach(t => {
        if (!posMap[t.symbol]) {
          posMap[t.symbol] = { symbol: t.symbol, qty: 0, totalCost: 0, trades: 0 };
        }
        const qty = parseFloat(t.qty);
        const price = parseFloat(t.price);
        if (t.side === 'buy') {
          posMap[t.symbol].qty += qty;
          posMap[t.symbol].totalCost += qty * price;
        } else {
          posMap[t.symbol].qty -= qty;
          posMap[t.symbol].totalCost -= qty * price;
        }
        posMap[t.symbol].trades++;
      });

      const posList = Object.values(posMap).filter(p => p.qty !== 0);
      posList.forEach(p => {
        p.avgPrice = p.totalCost / p.qty;
      });

      setPositions(posList);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '48px', margin: '0 0 30px 0' }}>PORTFOLIO</h1>

      <div style={s.box}>
        <h2 style={{ margin: '0 0 20px 0' }}>POSITIONS ({positions.length})</h2>
        {positions.length === 0 ? (
          <p>No open positions.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>SYMBOL</th>
                <th style={s.th}>QTY</th>
                <th style={s.th}>AVG PRICE</th>
                <th style={s.th}>TOTAL</th>
                <th style={s.th}>TRADES</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, idx) => (
                <tr key={idx}>
                  <td style={s.td}><strong>{pos.symbol}</strong></td>
                  <td style={{ ...s.td, ...(pos.qty > 0 ? s.positive : s.negative) }}>
                    {pos.qty > 0 ? '+' : ''}{pos.qty.toFixed(2)}
                  </td>
                  <td style={s.td}>${pos.avgPrice.toFixed(2)}</td>
                  <td style={s.td}>${pos.totalCost.toFixed(2)}</td>
                  <td style={s.td}>{pos.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={s.box}>
        <h2 style={{ margin: '0 0 20px 0' }}>TRADE HISTORY ({transactions.length})</h2>
        {transactions.length === 0 ? (
          <p>No trades.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>TIME</th>
                <th style={s.th}>SYMBOL</th>
                <th style={s.th}>SIDE</th>
                <th style={s.th}>QTY</th>
                <th style={s.th}>PRICE</th>
                <th style={s.th}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice().reverse().map((t) => (
                <tr key={t.id}>
                  <td style={s.td}>{new Date(t.ts).toLocaleString()}</td>
                  <td style={s.td}><strong>{t.symbol}</strong></td>
                  <td style={{ ...s.td, ...(t.side === 'buy' ? s.positive : s.negative) }}>
                    {t.side.toUpperCase()}
                  </td>
                  <td style={s.td}>{t.qty}</td>
                  <td style={s.td}>${parseFloat(t.price).toFixed(2)}</td>
                  <td style={s.td}>${(t.qty * t.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
