import { useEffect, useState } from 'react';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>("Checking backend connection...");

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online') {
          setHealthStatus(data.message);
        } else {
          setHealthStatus("System Offline: Database Error");
        }
      })
      .catch(() => setHealthStatus("System Offline: Cannot connect to backend"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas">
      {/* HUD Terminal Card Style Container */}
      <div className="bg-surface border-[1.5px] border-border-subtle rounded-lg p-10 flex flex-col items-center gap-8 hover:border-border-active hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all duration-200">
        
        <h1 className="font-display font-bold text-4xl text-primary tracking-tight">
          Tej.OS Command Deck
        </h1>
        
        <p className="font-mono text-accent-mint font-medium">
          {healthStatus}
        </p>

        {/* Mechanical Action Button */}
        <button className="
          font-display font-semibold text-[#090D16] 
          bg-accent-cyan border-[1.5px] border-[#020617] rounded-md 
          px-6 py-3 shadow-tactile 
          hover:-translate-y-[1px] hover:shadow-tactile-hover
          active:translate-y-[2px] active:shadow-none 
          transition-all duration-150
        ">
          Initialize Uplink
        </button>

      </div>
    </div>
  );
}

export default App;
