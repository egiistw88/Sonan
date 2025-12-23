
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical Application Error:", error);
  root.render(
    <div style={{ color: 'white', padding: 20, textAlign: 'center', backgroundColor: '#0f172a', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1>Aplikasi Gagal Memuat</h1>
      <p>Terjadi kesalahan teknis. Silakan refresh halaman.</p>
    </div>
  );
}
