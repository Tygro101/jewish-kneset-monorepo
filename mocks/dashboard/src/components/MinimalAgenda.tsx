import { useState, useEffect } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

interface AgendaItem {
  id: string;
  time: string;
  title: string;
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface WeekAgenda {
  monday: AgendaItem[];
  tuesday: AgendaItem[];
  wednesday: AgendaItem[];
  thursday: AgendaItem[];
  friday: AgendaItem[];
  saturday: AgendaItem[];
  sunday: AgendaItem[];
}

const initialWeekAgenda: WeekAgenda = {
  monday: [
    { id: "1", time: "09:00", title: "Team Standup Meeting" },
    { id: "2", time: "14:00", title: "Project Review" },
  ],
  tuesday: [
    { id: "3", time: "10:00", title: "Client Call" },
    { id: "4", time: "15:30", title: "Design Workshop" },
  ],
  wednesday: [
    { id: "5", time: "09:00", title: "Team Standup Meeting" },
    { id: "6", time: "13:00", title: "Lunch with Partners" },
  ],
  thursday: [
    { id: "7", time: "09:00", title: "Team Standup Meeting" },
    { id: "8", time: "11:30", title: "Design Review Session" },
    { id: "9", time: "14:00", title: "Submit Q4 Deliverables" },
    { id: "10", time: "16:00", title: "Client Presentation" },
  ],
  friday: [
    { id: "11", time: "10:00", title: "Code Review with Team" },
    { id: "12", time: "13:00", title: "Budget Report Due" },
    { id: "13", time: "15:30", title: "UX Workshop" },
  ],
  saturday: [
    { id: "14", time: "11:00", title: "Personal Project" },
  ],
  sunday: [
    { id: "15", time: "10:00", title: "Weekly Planning" },
  ],
};

const dayNames: { key: DayOfWeek; label: string; short: string; date: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon', date: 'Nov 24' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', date: 'Nov 25' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', date: 'Nov 26' },
  { key: 'thursday', label: 'Thursday', short: 'Thu', date: 'Nov 27' },
  { key: 'friday', label: 'Friday', short: 'Fri', date: 'Nov 28' },
  { key: 'saturday', label: 'Saturday', short: 'Sat', date: 'Nov 29' },
  { key: 'sunday', label: 'Sunday', short: 'Sun', date: 'Nov 30' },
];

export function MinimalAgenda() {
  const [weekAgenda, setWeekAgenda] = useState<WeekAgenda>(initialWeekAgenda);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTime, setNewItemTime] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set(['thursday']));
  const [visibleDayStart, setVisibleDayStart] = useState(3); // Start at Thursday (index 3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentHourMinute = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isCurrentOrUpcoming = (itemTime: string, dayKey: DayOfWeek) => {
    // Only highlight for current day (Thursday for now)
    if (dayKey !== 'thursday') return false;
    
    const current = getCurrentHourMinute();
    const currentMinutes = parseInt(current.split(':')[0]) * 60 + parseInt(current.split(':')[1]);
    const itemMinutes = parseInt(itemTime.split(':')[0]) * 60 + parseInt(itemTime.split(':')[1]);
    
    return itemMinutes >= currentMinutes && itemMinutes <= currentMinutes + 60;
  };

  const toggleDay = (day: DayOfWeek) => {
    const newSelected = new Set(selectedDays);
    if (newSelected.has(day)) {
      newSelected.delete(day);
    } else {
      newSelected.add(day);
    }
    setSelectedDays(newSelected);
  };

  const selectAllWeekdays = () => {
    setSelectedDays(new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']));
  };

  const selectAllDays = () => {
    setSelectedDays(new Set(dayNames.map(d => d.key)));
  };

  const handleAddItem = () => {
    if (!newItemTime || !newItemTitle || selectedDays.size === 0) return;

    const newWeekAgenda = { ...weekAgenda };
    
    selectedDays.forEach((day) => {
      const newItem: AgendaItem = {
        id: `${Date.now()}-${day}`,
        time: newItemTime,
        title: newItemTitle,
      };
      
      newWeekAgenda[day] = [...newWeekAgenda[day], newItem].sort((a, b) => 
        a.time.localeCompare(b.time)
      );
    });

    setWeekAgenda(newWeekAgenda);
    setNewItemTime("");
    setNewItemTitle("");
    setSelectedDays(new Set(['thursday']));
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string, day: DayOfWeek) => {
    setWeekAgenda({
      ...weekAgenda,
      [day]: weekAgenda[day].filter(item => item.id !== id),
    });
  };

  const visibleDays = dayNames.slice(visibleDayStart, visibleDayStart + 2);

  const goToPreviousDays = () => {
    if (visibleDayStart > 0) {
      setVisibleDayStart(visibleDayStart - 1);
    }
  };

  const goToNextDays = () => {
    if (visibleDayStart < dayNames.length - 2) {
      setVisibleDayStart(visibleDayStart + 1);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Navigation and Add Button */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousDays}
            disabled={visibleDayStart === 0}
            className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 disabled:opacity-30 disabled:hover:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={goToNextDays}
            disabled={visibleDayStart >= dayNames.length - 2}
            className="p-1.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-teal-500/50 disabled:opacity-30 disabled:hover:border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Event</span>
        </button>
      </div>

      {/* Add Event Form Overlay */}
      {showAddForm && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => {
              setShowAddForm(false);
              setNewItemTime("");
              setNewItemTitle("");
              setSelectedDays(new Set(['thursday']));
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          {/* Form Modal */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] z-50 p-4 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl space-y-3">
            <h3 className="text-white mb-3">Add New Event</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Time</label>
                <input
                  type="time"
                  value={newItemTime}
                  onChange={(e) => setNewItemTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Title</label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  placeholder="Event title"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">Select Days</label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllWeekdays}
                    className="text-xs text-teal-400 hover:text-teal-300"
                  >
                    Weekdays
                  </button>
                  <button
                    onClick={selectAllDays}
                    className="text-xs text-teal-400 hover:text-teal-300"
                  >
                    All Week
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <button
                    key={day.key}
                    onClick={() => toggleDay(day.key)}
                    className={`py-2 px-1 rounded text-xs transition-colors ${
                      selectedDays.has(day.key)
                        ? 'bg-teal-500/30 border border-teal-500 text-teal-300'
                        : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                disabled={selectedDays.size === 0 || !newItemTime || !newItemTitle}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded px-3 py-2 text-sm transition-colors"
              >
                Add to {selectedDays.size} {selectedDays.size === 1 ? 'day' : 'days'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemTime("");
                  setNewItemTitle("");
                  setSelectedDays(new Set(['thursday']));
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Days Columns */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {visibleDays.map((day, index) => {
          const accentColor = index === 0 ? 'teal' : 'purple';
          const items = weekAgenda[day.key];

          return (
            <div key={day.key} className="flex-1 flex flex-col">
              <div className="mb-4">
                <h2 className="text-slate-400 text-sm mb-1">{day.label}</h2>
                <p className="text-white text-xl">{day.date}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No events scheduled
                  </div>
                ) : (
                  items.map((item) => {
                    const isCurrent = isCurrentOrUpcoming(item.time, day.key);
                    return (
                      <div
                        key={item.id}
                        className={`group flex flex-col gap-1 py-2.5 px-3 rounded-lg transition-all ${
                          isCurrent
                            ? `bg-${accentColor}-500/20 border-2 border-${accentColor}-500/50 shadow-lg`
                            : `bg-slate-900/30 border border-slate-800 hover:border-${accentColor}-500/30`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-${accentColor}-400 text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                            {item.time}
                            {isCurrent && <span className="ml-2 text-xs">● Now</span>}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id, day.key)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-slate-300 text-sm">{item.title}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}