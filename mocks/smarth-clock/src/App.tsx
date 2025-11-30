import { Clock } from './components/Clock';
import { Messages } from './components/Messages';
import { DayTimes } from './components/DayTimes';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      {/* Tablet Frame */}
      <div className="w-full max-w-2xl aspect-[3/4] bg-slate-950 rounded-3xl shadow-2xl border-8 border-slate-800 overflow-hidden">
        <div className="h-full flex flex-col p-8">
          {/* Digital Clock */}
          <Clock />
          
          {/* Messages Section */}
          <Messages />
          
          {/* Day Times */}
          <DayTimes />
        </div>
      </div>
    </div>
  );
}
