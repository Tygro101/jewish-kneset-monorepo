import { useState, useEffect } from "react";

export function TabletClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  const date = time.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="relative">
      {/* Tablet Frame */}
      <div className="relative bg-gradient-to-b from-slate-700 to-slate-800 rounded-[2.5rem] p-4 shadow-2xl">
        {/* Screen */}
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-purple-950 rounded-[2rem] w-[500px] h-[650px] overflow-hidden shadow-inner relative">
          {/* Camera */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rounded-full border-2 border-slate-700"></div>
          
          {/* Clock Display */}
          <div className="h-full flex flex-col items-center justify-center p-12">
            {/* Time */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-9xl text-white tracking-tight">{hours}</span>
              <span className="text-9xl text-blue-400 animate-pulse">:</span>
              <span className="text-9xl text-white tracking-tight">{minutes}</span>
            </div>
            
            {/* Seconds */}
            <div className="text-4xl text-slate-400 mb-12">{seconds}</div>
            
            {/* Date */}
            <div className="text-xl text-slate-300">{date}</div>
            
            {/* Decorative Elements */}
            <div className="mt-12 flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Power Button */}
        <div className="absolute right-0 top-32 w-1 h-12 bg-slate-900 rounded-l"></div>
        
        {/* Volume Buttons */}
        <div className="absolute right-0 top-52 w-1 h-8 bg-slate-900 rounded-l"></div>
        <div className="absolute right-0 top-64 w-1 h-8 bg-slate-900 rounded-l"></div>
      </div>
    </div>
  );
}
