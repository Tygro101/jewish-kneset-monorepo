import { Sunrise, Sun, Sunset, Moon, Cloud, Star, CloudMoon, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DayTimes() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dayTimes = [
    { id: 1, label: 'Dawn', time: '06:15', icon: Cloud },
    { id: 2, label: 'Sunrise', time: '06:42', icon: Sunrise },
    { id: 3, label: 'Golden Hour', time: '07:15', icon: Sparkles },
    { id: 4, label: 'Solar Noon', time: '12:15', icon: Sun },
    { id: 5, label: 'Golden Hour', time: '17:15', icon: Sparkles },
    { id: 6, label: 'Sunset', time: '17:48', icon: Sunset },
    { id: 7, label: 'Dusk', time: '18:16', icon: CloudMoon },
    { id: 8, label: 'Night', time: '18:45', icon: Moon },
    { id: 9, label: 'Midnight', time: '00:00', icon: Star },
  ];

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Find the next upcoming time or current time period
  const findClosestTime = () => {
    let closestIndex = 0;
    let minDiff = Infinity;

    dayTimes.forEach((dayTime, index) => {
      let timeMinutes = timeToMinutes(dayTime.time);
      
      // Handle midnight wraparound
      let diff = timeMinutes - currentMinutes;
      if (diff < 0) {
        diff += 24 * 60; // Add 24 hours if time has passed today
      }

      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const closestTimeIndex = findClosestTime();

  return (
    <div className="py-6">
      <h2 className="text-slate-300 mb-4">Day Times</h2>
      <div className="grid grid-cols-3 gap-3">
        {dayTimes.map((item, index) => {
          const Icon = item.icon;
          const isClosest = index === closestTimeIndex;
          
          return (
            <div
              key={item.id}
              className={`rounded-xl p-3 border transition-all duration-300 ${
                isClosest
                  ? 'bg-gradient-to-br from-emerald-600/40 to-emerald-700/40 border-emerald-500/60 shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-gradient-to-br from-slate-800/60 to-slate-800/40 border-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isClosest ? 'text-emerald-300' : 'text-amber-400'}`} />
                <span className={`text-sm ${isClosest ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
              <div className={`text-lg font-mono ${isClosest ? 'text-emerald-100' : 'text-slate-100'}`}>
                {item.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}