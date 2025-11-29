'use client';
import { useState, useEffect } from 'react';
import { getLogs, clearLogs } from '../../lib/mockApi';

const s = {
  box: { border: '2px solid #000', padding: '30px', marginBottom: '20px' },
  btn: { border: '2px solid #000', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', background: '#000', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' },
  btnDanger: { border: '2px solid #000', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', background: '#fff', color: '#000', cursor: 'pointer', fontFamily: 'monospace', marginLeft: '10px' },
  logEntry: { border: '2px solid #000', padding: '20px', marginBottom: '15px', background: '#f9f9f9' },
  method: { display: 'inline-block', padding: '5px 10px', background: '#000', color: '#fff', fontWeight: 'bold', marginRight: '10px' },
  status: { display: 'inline-block', padding: '5px 10px', fontWeight: 'bold', marginLeft: '10px' },
  code: { background: '#f0f0f0', padding: '10px', marginTop: '10px', border: '1px solid #000', overflow: 'auto', fontSize: '14px', whiteSpace: 'pre-wrap' },
};

export default function Logs() {
  const [logs, setLogs] = useState([]);

  const loadLogs = () => {
    setLogs(getLogs());
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (confirm('Clear all logs?')) {
      clearLogs();
      setLogs([]);
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#00aa00';
    if (status >= 400) return '#aa0000';
    return '#000';
  };

  return (
    <div>
      <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>API LOGS</h1>

      <div style={s.box}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>REQUEST LOG ({logs.length})</h2>
          <button onClick={handleClear} style={s.btnDanger}>CLEAR LOGS</button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div style={s.box}>
          <p>No API calls logged. Use the app to generate requests.</p>
        </div>
      ) : (
        logs.slice().reverse().map((log, idx) => (
          <div key={idx} style={s.logEntry}>
            <div style={{ marginBottom: '10px' }}>
              <span style={s.method}>{log.method}</span>
              <span style={{ fontWeight: 'bold' }}>{log.endpoint}</span>
              <span style={{ ...s.status, color: getStatusColor(log.status) }}>{log.status}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              {new Date(log.timestamp).toLocaleString()}
            </div>

            <div>
              <strong>Request:</strong>
              <div style={s.code}>{JSON.stringify(log.request, null, 2)}</div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <strong>Response:</strong>
              <div style={s.code}>{JSON.stringify(log.response, null, 2)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
