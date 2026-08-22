import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoadingScreen.css';

export function LoadingScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING BOOT SEQUENCE...');

  useEffect(() => {
    const sequence = [
      { t: 200, text: 'MOUNTING FILE SYSTEMS...', p: 15 },
      { t: 600, text: 'ESTABLISHING SECURE CONNECTION...', p: 40 },
      { t: 1200, text: 'LOADING PERSONNEL REGISTRY...', p: 65 },
      { t: 1600, text: 'SYNCING OPERATIONAL DATA...', p: 85 },
      { t: 2100, text: 'SYSTEM READY.', p: 100 },
    ];

    let timeouts = [];
    sequence.forEach((step) => {
      timeouts.push(
        setTimeout(() => {
          setStatusText(step.text);
          setProgress(step.p);
        }, step.t)
      );
    });

    const finalTimeout = setTimeout(() => {
      navigate('/employees');
    }, 2500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(finalTimeout);
    };
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="loading-box">
        <div className="logo-mark-lg animate-pulse mb-6"></div>
        <h1 className="font-serif text-3xl mb-12">Dayflow</h1>
        
        <div className="loading-bar-container">
          <div className="loading-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="loading-status font-mono text-xs uppercase mt-4 text-muted">
          {statusText}
        </div>
      </div>
    </div>
  );
}
