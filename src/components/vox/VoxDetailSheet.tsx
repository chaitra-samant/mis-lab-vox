import { useState } from "react";
import { X, ChevronDown, MessageSquare, LayoutDashboard } from "lucide-react";
import { VoxButton } from "./VoxButton";
import { VoxChat } from "./VoxChat";
import type { EmployeeSentiment } from "@/lib/mock";
import { cn } from "@/lib/utils";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Sentiment = EmployeeSentiment;
export type Status = "Open" | "In progress" | "Escalated" | "Resolved" | "Closed";

export interface MappedComplaint {
  id: string;
  realId: string;
  subject: string;
  priority: Priority;
  sentiment: Sentiment;
  status: Status;
  assignee: string;
  assigneeId: string | null;
  customer: string;
  account: string;
  exposure: string;
  channel: string;
  ts: string;
  body: string;
  aiAnalysis?: {
    summary: string;
    urgency: string;
    classification: string;
    financial_loss_estimate?: number;
    sentiment: string;
    signals?: {
      blast_radius: string;
      trend_risk: string;
      business_impact_hint: string;
      similar_issue_cluster: string;
      novelty_score: string;
      failure_point_guess: string;
      dependency_risk: string;
      missing_info: string;
      next_best_action: string;
      auto_routing_hint: string;
      escalation_reason: string;
    };
  };
  messages?: { role: "customer" | "employee"; content: string; ts: string }[];
}

export function VoxDetailSheet({
  vox,
  suggestedResponse,
  employees,
  currentUserRole = "employee",
  onClose,
  onResolve,
  onEscalate,
  onUpdate,
  onSendMessage,
}: {
  vox: MappedComplaint;
  suggestedResponse: string | null;
  employees: any[];
  currentUserRole?: "customer" | "employee";
  onClose: () => void;
  onResolve: (id: string) => void;
  onEscalate: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onSendMessage: (content: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");
  const allStatuses = ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];
  const currentDbStatus = vox.status.toUpperCase().replace(" ", "_");

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between border-b px-6 pt-5 pb-3">
          <div>
            <div className="font-mono text-xs text-slate-400">{vox.id}</div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">{vox.subject}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px",
              activeTab === "overview" 
                ? "border-slate-900 text-slate-900" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px relative",
              activeTab === "chat" 
                ? "border-slate-900 text-slate-900" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
            {vox.messages && vox.messages.length > 0 && (
              <span className="absolute top-2 right-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "overview" ? (
            <div className="px-6 py-5">
              <dl className="grid grid-cols-2 gap-4 border-b pb-5">
                <Field label="Customer" value={vox.customer} />
                <Field label="Exposure" value={vox.exposure} />
                
                <div>
                  <dt className="text-[10px] font-bold uppercase text-slate-500 mb-1">Status</dt>
                  <select 
                    value={currentDbStatus}
                    onChange={(e) => onUpdate(vox.realId, { status: e.target.value })}
                    className="h-8 w-full rounded-md border border-slate-200 text-sm focus:ring-1 focus:ring-slate-400 outline-none px-2 bg-slate-50"
                  >
                    {allStatuses.map(s => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <dt className="text-[10px] font-bold uppercase text-slate-500 mb-1">Assignee</dt>
                  <EmployeeSelect 
                    employees={employees} 
                    value={vox.assigneeId} 
                    onChange={(empId) => onUpdate(vox.realId, { assigned_to: empId })} 
                  />
                </div>
              </dl>

              <div className="mt-5">
                <div className="text-xs font-medium uppercase text-slate-500">Customer narrative</div>
                <p className="mt-2 rounded-md border bg-slate-50/60 p-3 text-sm text-slate-700">
                  {vox.body}
                </p>
              </div>

              <div className="mt-6">
                <div className="text-xs font-medium uppercase text-slate-500">AI signals</div>
                {suggestedResponse && (
                  <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                    <div className="text-[10px] font-bold uppercase text-blue-500 mb-1">
                      Suggested Response
                    </div>
                    <p className="text-sm text-slate-700">{suggestedResponse}</p>
                  </div>
                )}
                {vox.aiAnalysis && (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-md border p-3 bg-slate-50">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">AI Summary</div>
                      <p className="text-sm text-slate-700">{vox.aiAnalysis.summary}</p>
                    </div>
                    
                    {vox.aiAnalysis.signals && (
                      <div className="grid grid-cols-2 gap-3">
                        <SignalItem label="Blast Radius" value={vox.aiAnalysis.signals.blast_radius} />
                        <SignalItem label="Trend Risk" value={vox.aiAnalysis.signals.trend_risk} />
                        <SignalItem label="Impact" value={vox.aiAnalysis.signals.business_impact_hint} />
                        <SignalItem label="Novelty" value={vox.aiAnalysis.signals.novelty_score} />
                        <SignalItem label="Team" value={vox.aiAnalysis.signals.auto_routing_hint} />
                        <SignalItem label="Dependency" value={vox.aiAnalysis.signals.dependency_risk} />
                        
                        <div className="col-span-2 rounded-md border p-2.5 bg-indigo-50/30 border-indigo-100">
                          <div className="text-[10px] font-bold text-indigo-500 uppercase">Next Best Action</div>
                          <p className="mt-1 text-xs font-medium text-slate-800">{vox.aiAnalysis.signals.next_best_action}</p>
                        </div>

                        <div className="col-span-2 rounded-md border p-2.5 bg-slate-50">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Failure Point Guess</div>
                          <p className="mt-1 text-xs text-slate-700">{vox.aiAnalysis.signals.failure_point_guess}</p>
                        </div>

                        {vox.aiAnalysis.signals.missing_info !== "None" && (
                          <div className="col-span-2 rounded-md border p-2.5 bg-amber-50 border-amber-100">
                            <div className="text-[10px] font-bold text-amber-600 uppercase">Missing Info</div>
                            <p className="mt-1 text-xs text-slate-700">{vox.aiAnalysis.signals.missing_info}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <VoxChat 
              complaintId={vox.realId}
              messages={vox.messages || []}
              onSendMessage={onSendMessage}
              currentUserRole={currentUserRole}
            />
          )}
        </div>

        <div className="flex items-center gap-2 border-t bg-slate-50/50 px-6 py-3.5">
          <VoxButton 
            variant="secondary" 
            size="sm"
            onClick={() => onEscalate(vox.realId)}
            disabled={vox.status === "Escalated"}
          >
            Escalate
          </VoxButton>
          <VoxButton 
            size="sm" 
            className="ml-auto"
            onClick={() => onResolve(vox.realId)}
            disabled={vox.status === "Resolved"}
          >
            Resolve
          </VoxButton>
        </div>
      </aside>
    </div>
  );
}

function EmployeeSelect({ 
  employees, 
  value, 
  onChange 
}: { 
  employees: any[]; 
  value: string | null; 
  onChange: (id: string | null) => void; 
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedEmp = employees.find(e => e.id === value);
  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <div 
        className="flex items-center justify-between h-8 w-full rounded-md border border-slate-200 px-2 bg-slate-50 text-sm cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{selectedEmp ? selectedEmp.name : "Unassigned"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </div>

      {open && (
        <div className="absolute z-10 top-9 left-0 w-full bg-white border shadow-lg rounded-md overflow-hidden">
          <div className="p-1 border-b">
            <input 
              autoFocus
              className="w-full text-xs p-1.5 outline-none rounded-sm bg-slate-50"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            <div 
              className="px-2 py-1.5 text-xs cursor-pointer hover:bg-slate-50 text-slate-500 italic"
              onClick={() => { onChange(null); setOpen(false); }}
            >
              Unassigned
            </div>
            {filtered.map(emp => (
              <div 
                key={emp.id} 
                className="px-2 py-1.5 text-xs cursor-pointer hover:bg-slate-50 border-t border-slate-50"
                onClick={() => { onChange(emp.id); setOpen(false); }}
              >
                <div className="font-medium text-slate-900">{emp.name}</div>
                <div className="text-[10px] text-slate-500">{emp.department}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-2 py-3 text-xs text-slate-500 text-center">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function SignalItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2 bg-white shadow-sm border-slate-100">
      <div className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</div>
      <div className="text-[11px] font-semibold text-slate-900 truncate" title={value}>{value}</div>
    </div>
  );
}
