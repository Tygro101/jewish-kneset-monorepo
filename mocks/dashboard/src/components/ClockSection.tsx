import { useState, useEffect } from "react";
import { Cloud, Sunrise, Sun, Sunset, Moon, Star, Sparkles } from "lucide-react";

interface DayTime {
  icon: any;
  label: string;
  time: string;
  timeEnd?: string;
  color: string;
  highlight?: boolean;
}

export function ClockSection() {
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
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  const dayTimes: DayTime[] = [
    { icon: Cloud, label: "Dawn", time: "06:15", color: "text-slate-400" },
    { icon: Sunrise, label: "Sunrise", time: "06:42", color: "text-orange-400" },
    { icon: Sparkles, label: "Golden Hour", time: "07:15", timeEnd: "08:00", color: "text-yellow-400" },
    { icon: Sun, label: "Solar Noon", time: "12:15", color: "text-yellow-300" },
    { icon: Sparkles, label: "Golden Hour", time: "17:15", timeEnd: "17:48", color: "text-amber-400", highlight: true },
    { icon: Sunset, label: "Sunset", time: "17:48", color: "text-orange-500" },
    { icon: Moon, label: "Dusk", time: "18:16", color: "text-indigo-400" },
    { icon: Moon, label: "Night", time: "18:45", timeEnd: "23:59", color: "text-indigo-500" },
    { icon: Star, label: "Midnight", time: "00:00", timeEnd: "06:15", color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Clock */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-1">
          <span className="text-9xl text-teal-400 tracking-tight">{hours}</span>
          <span className="text-9xl text-teal-400">:</span>
          <span className="text-9xl text-teal-400 tracking-tight">{minutes}</span>
          <span className="text-9xl text-teal-400">:</span>
          <span className="text-9xl text-teal-400 tracking-tight">{seconds}</span>
        </div>
        <p className="text-slate-400 text-lg">{date}</p>
      </div>

      {/* Day Times */}
      <div className="space-y-3">
        <h3 className="text-slate-400 text-sm">Day Times</h3>
        <div className="grid grid-cols-3 gap-2">
          {dayTimes.map((item, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 ${
                item.highlight 
                  ? 'bg-teal-500/10 border border-teal-500/30' 
                  : 'bg-slate-900/50 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-xs text-slate-400">{item.label}</span>
              </div>
              <div className="text-white text-sm">
                {item.time}
                {item.timeEnd && (
                  <span className="text-slate-500"> - {item.timeEnd}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
