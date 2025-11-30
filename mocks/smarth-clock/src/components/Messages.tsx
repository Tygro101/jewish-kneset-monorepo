import { CloudRain, Thermometer, Cloud, Wind, Flower, Calendar, Coffee, Users, Briefcase, GraduationCap, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function Messages() {
  const [currentView, setCurrentView] = useState(0); // 0 = annotations, 1 = agenda
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [agenda, setAgenda] = useState([
    { id: 1, text: "Morning standup", time: "08:00 AM", icon: Coffee, iconColor: "text-amber-400" },
    { id: 2, text: "Team meeting", time: "10:30 AM", icon: Users, iconColor: "text-purple-400" },
    { id: 3, text: "Lunch with client", time: "12:00 PM", icon: Briefcase, iconColor: "text-emerald-400" },
    { id: 4, text: "Design review", time: "02:00 PM", icon: GraduationCap, iconColor: "text-indigo-400" },
    { id: 5, text: "Project sync", time: "04:00 PM", icon: Calendar, iconColor: "text-rose-400" },
  ]);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    time: '',
    days: [] as string[]
  });

  const agendaRef = useRef<HTMLDivElement>(null);

  const annotations = [
    { id: 1, text: "Should rain in the afternoon", time: "14:00", icon: CloudRain, iconColor: "text-blue-400" },
    { id: 2, text: "Temperature dropping to 12°C", time: "18:00", icon: Thermometer, iconColor: "text-cyan-400" },
    { id: 3, text: "Clear skies expected", time: "20:00", icon: Cloud, iconColor: "text-sky-300" },
    { id: 4, text: "High pollen count today", time: "All day", icon: Flower, iconColor: "text-pink-400" },
    { id: 5, text: "Wind speed: 15 km/h", time: "Now", icon: Wind, iconColor: "text-teal-400" },
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentView === 1) {
        setCurrentView(0);
      } else if (e.key === 'ArrowRight' && currentView === 0) {
        setCurrentView(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  // Auto-scroll agenda
  useEffect(() => {
    if (currentView !== 1) return; // Only scroll when on agenda view
    
    const scrollContainer = agendaRef.current;
    if (!scrollContainer || agenda.length <= 3) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }
      scrollContainer.scrollTop = scrollPosition;
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [currentView, agenda.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentView === 0) {
      setCurrentView(1);
    }
    if (isRightSwipe && currentView === 1) {
      setCurrentView(0);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStart) {
      setTouchEnd(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) {
      setTouchStart(0);
      setTouchEnd(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentView === 0) {
      setCurrentView(1);
    }
    if (isRightSwipe && currentView === 1) {
      setCurrentView(0);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const days = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

  const toggleDay = (day: string) => {
    setNewMeeting(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleAddMeeting = () => {
    if (!newMeeting.title || !newMeeting.time) return;

    const newAgendaItem = {
      id: Date.now(),
      text: newMeeting.title + (newMeeting.days.length > 0 ? ` (${newMeeting.days.join(', ')})` : ''),
      time: newMeeting.time,
      icon: Calendar,
      iconColor: "text-rose-400"
    };

    setAgenda([...agenda, newAgendaItem]);
    setNewMeeting({ title: '', time: '', days: [] });
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 py-6 border-b border-slate-700 flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-300">
          {currentView === 0 ? "Today's Annotations" : "Today's Agenda"}
        </h2>
        <div className="flex items-center gap-3">
          {currentView === 1 && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-6 h-6 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
            </button>
          )}
          <div className="flex gap-2">
            <div className={`w-2 h-2 rounded-full transition-colors ${currentView === 0 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${currentView === 1 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </div>
        </div>
      </div>

      {currentView === 1 && showAddForm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg p-4 mx-6 w-full max-w-sm space-y-2 shadow-2xl border border-slate-700">
            <input
              type="text"
              placeholder="Meeting title"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              className="w-full bg-slate-900/50 text-slate-200 px-2 py-1.5 rounded text-sm border border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="time"
              value={newMeeting.time}
              onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
              className="w-full bg-slate-900/50 text-slate-200 px-2 py-1.5 rounded text-sm border border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex gap-1">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`flex-1 py-1 rounded text-xs transition-colors ${
                    newMeeting.days.includes(day)
                      ? 'bg-emerald-500 text-slate-900'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddMeeting}
                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-1.5 rounded text-sm transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewMeeting({ title: '', time: '', days: [] });
                }}
                className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-400 py-1.5 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="select-none cursor-grab active:cursor-grabbing flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentView === 0 ? (
          <div className="space-y-2">
            {annotations.map((annotation) => {
              const Icon = annotation.icon;
              return (
                <div
                  key={annotation.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${annotation.iconColor} flex-shrink-0`} />
                  <span className="text-slate-200 flex-1">{annotation.text}</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    {annotation.time}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div 
            ref={agendaRef}
            className="space-y-2 overflow-hidden"
            style={{ maxHeight: '100%' }}
          >
            {agenda.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <Icon className={`w-4 h-4 ${item.iconColor} flex-shrink-0`} />
                  <span className="text-slate-200 flex-1">{item.text}</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}