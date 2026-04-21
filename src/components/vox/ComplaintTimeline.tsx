import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  title: string;
  ts: string;
  completed: boolean;
  active: boolean;
  messages?: { role: string; content: string; ts: string }[];
}

interface ComplaintTimelineProps {
  events: TimelineEvent[];
}

export function ComplaintTimeline({ events }: ComplaintTimelineProps) {
  return (
    <ol className="space-y-6 px-1">
      {events.map((event, i) => (
        <li key={event.title} className="relative flex items-start gap-4">
          {/* Connecting line */}
          {i < events.length - 1 && (
            <div
              className={cn(
                "absolute bottom-0 left-[11px] top-8 w-px",
                event.completed ? "bg-slate-900" : "bg-slate-200"
              )}
            />
          )}

          {/* Icon */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold bg-white",
                event.completed
                  ? "border-slate-900 bg-slate-900 text-white"
                  : event.active
                    ? "border-slate-900 text-slate-900" 
                    : "border-slate-300 text-slate-400",
                event.active && "ring-4 ring-slate-900/10"
              )}
            >
              {event.completed && !event.active ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pb-2 pt-0.5">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
              <h4
                className={cn(
                  "text-sm font-semibold",
                  event.active || event.completed ? "text-slate-900" : "text-slate-500"
                )}
              >
                {event.title}
              </h4>
              <time className="text-xs text-slate-400 mt-1 sm:mt-0">{event.ts}</time>
            </div>
            
            {event.messages && event.messages.length > 0 && (
              <div className="mt-3 space-y-3 rounded-lg border border-slate-200/60 bg-slate-50/50 p-4">
                {event.messages.map((msg, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-slate-900 block mb-0.5">
                      {msg.role === "employee" ? "Agent" : "You"} <span className="text-slate-400 font-normal text-xs ml-2">{new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span className="text-slate-600 line-clamp-3">{msg.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
