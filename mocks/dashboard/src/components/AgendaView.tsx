import { Calendar, Clock, FileText } from "lucide-react";

interface Meeting {
  time: string;
  title: string;
  description: string;
  type: 'meeting' | 'annotation';
}

const todayMeetings: Meeting[] = [
  {
    time: "09:00 AM",
    title: "Team Standup",
    description: "Daily sync with development team",
    type: "meeting"
  },
  {
    time: "11:30 AM",
    title: "Design Review",
    description: "Review new Android TV interface mockups",
    type: "meeting"
  },
  {
    time: "02:00 PM",
    title: "Project Deadline",
    description: "Submit Q4 project deliverables",
    type: "annotation"
  },
  {
    time: "04:00 PM",
    title: "Client Presentation",
    description: "Present Android TV app prototype",
    type: "meeting"
  }
];

const tomorrowMeetings: Meeting[] = [
  {
    time: "10:00 AM",
    title: "Code Review Session",
    description: "Review pull requests from team",
    type: "meeting"
  },
  {
    time: "01:00 PM",
    title: "Important: Budget Report",
    description: "Prepare financial summary for stakeholders",
    type: "annotation"
  },
  {
    time: "03:30 PM",
    title: "UX Workshop",
    description: "Brainstorm user experience improvements",
    type: "meeting"
  }
];

export function AgendaView() {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Today's Agenda */}
      <div className="flex-1 bg-slate-800/50 backdrop-blur rounded-3xl p-6 border border-slate-700/50 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl text-white">Today</h2>
            <p className="text-sm text-slate-400">Thursday, November 27, 2025</p>
          </div>
        </div>
        
        <div className="space-y-3 overflow-y-auto max-h-[calc(100%-5rem)]">
          {todayMeetings.map((meeting, index) => (
            <div 
              key={index}
              className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  {meeting.type === 'meeting' ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-blue-300">{meeting.time}</span>
                    {meeting.type === 'annotation' && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Note</span>
                    )}
                  </div>
                  <h3 className="text-white mb-1">{meeting.title}</h3>
                  <p className="text-sm text-slate-400">{meeting.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tomorrow's Agenda */}
      <div className="flex-1 bg-slate-800/50 backdrop-blur rounded-3xl p-6 border border-slate-700/50 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl text-white">Tomorrow</h2>
            <p className="text-sm text-slate-400">Friday, November 28, 2025</p>
          </div>
        </div>
        
        <div className="space-y-3 overflow-y-auto max-h-[calc(100%-5rem)]">
          {tomorrowMeetings.map((meeting, index) => (
            <div 
              key={index}
              className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  {meeting.type === 'meeting' ? (
                    <Clock className="w-5 h-5 text-purple-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-purple-300">{meeting.time}</span>
                    {meeting.type === 'annotation' && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Note</span>
                    )}
                  </div>
                  <h3 className="text-white mb-1">{meeting.title}</h3>
                  <p className="text-sm text-slate-400">{meeting.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
