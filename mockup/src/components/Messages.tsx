export function Messages() {
  const messages = [
    { id: 1, text: "Good morning! Don't forget your morning meeting at 10 AM", time: "08:30" },
    { id: 2, text: "Reminder: Take your vitamins", time: "09:00" },
    { id: 3, text: "Lunch break scheduled", time: "12:30" },
  ];

  return (
    <div className="flex-1 py-8 border-b border-slate-700 overflow-y-auto">
      <h2 className="text-slate-300 mb-4">Today's Reminders</h2>
      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-slate-200 flex-1">{message.text}</p>
              <span className="text-emerald-400 font-mono text-sm whitespace-nowrap">
                {message.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
