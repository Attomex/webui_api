// src/index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const Root = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ждем полной загрузки всех ресурсов
    window.addEventListener('load', () => {
      setIsLoaded(true);
    });

    // На случай, если событие 'load' уже произошло
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    }

    return () => window.removeEventListener('load', () => {});
  }, []);

  return (
    <React.StrictMode>
      {!isLoaded ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          zIndex: 9999
        }}>
          <div style={{
            width: 50,
            height: 50,
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <App />
      )}
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);