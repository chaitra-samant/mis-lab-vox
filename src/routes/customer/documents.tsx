import { createFileRoute } from "@tanstack/react-router";
import { Home, MessageSquare, Clock, FileText, Download, Paperclip, Loader2, ExternalLink, File, Image, FileVideo } from "lucide-react";
import { VoxShell } from "@/components/vox/VoxShell";
import { VoxCard } from "@/components/vox/VoxCard";
import { VoxBadge } from "@/components/vox/VoxBadge";
import { MOCK_CUSTOMER } from "@/lib/mock";
import { formatDistanceToNow, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "@/lib/server/complaints";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/documents")({
  head: () => ({
    meta: [{ title: "Documents — Vox" }],
  }),
  component: CustomerDocumentsPage,
});

function getFileIcon(url: string) {
  if (!url) return File;
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return Image;
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return FileVideo;
  return File;
}

function getFileType(url: string) {
  if (!url) return "Document";
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "Image";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "Video";
  if (ext === "pdf") return "PDF";
  return "File";
}

function getFileName(url: string) {
  if (!url) return "attachment";
  return url.split("/").pop()?.split("?")[0] ?? "attachment";
}

function CustomerDocumentsPage() {
  const { data: rawComplaints, isLoading } = useQuery({
    queryKey: ["complaints", "customer"],
    queryFn: () => getComplaints({ data: "customer" }),
  });

  const complaints = Array.isArray(rawComplaints) ? rawComplaints : [];

  // Gather all voxes that have attachments
  const voxesWithDocs = complaints.filter(
    (c: any) => c.attachments && c.attachments.length > 0
  );

  const totalDocs = voxesWithDocs.reduce(
    (acc: number, c: any) => acc + (c.attachments?.length ?? 0),
    0
  );

  return (
    <VoxShell
      accent="blue"
      portalLabel="Customer"
      user={{ name: MOCK_CUSTOMER.name, role: MOCK_CUSTOMER.role }}
      navItems={[
        { label: "Overview", icon: <Home />, to: "/customer" },
        { label: "My Voxes", icon: <MessageSquare />, to: "/customer/complaints" },
        { label: "Documents", icon: <FileText />, to: "/customer/documents", active: true },
        { label: "Activity", icon: <Clock />, to: "/customer/history" },
      ]}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Attachments & Files
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Documents
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All files and attachments submitted with your Voxes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : voxesWithDocs.length === 0 ? (
          <VoxCard className="p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
              <Paperclip className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No documents yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
              When you attach files to a Vox submission, they'll appear here for easy access.
            </p>
          </VoxCard>
        ) : (
          <>
            {/* Summary strip */}
            <div className="grid gap-4 sm:grid-cols-3">
              <VoxCard className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Files</p>
                <div className="mt-3 text-3xl font-semibold text-slate-900">{totalDocs}</div>
                <p className="mt-1 text-xs text-slate-500">Across {voxesWithDocs.length} Vox{voxesWithDocs.length !== 1 ? "es" : ""}</p>
              </VoxCard>
              <VoxCard className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Images</p>
                <div className="mt-3 text-3xl font-semibold text-slate-900">
                  {complaints.reduce((acc: number, c: any) =>
                    acc + (c.attachments?.filter((a: string) => getFileType(a) === "Image").length ?? 0), 0)}
                </div>
                <p className="mt-1 text-xs text-slate-500">Screenshots & photos</p>
              </VoxCard>
              <VoxCard className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Other Files</p>
                <div className="mt-3 text-3xl font-semibold text-slate-900">
                  {complaints.reduce((acc: number, c: any) =>
                    acc + (c.attachments?.filter((a: string) => getFileType(a) !== "Image").length ?? 0), 0)}
                </div>
                <p className="mt-1 text-xs text-slate-500">PDFs, videos & docs</p>
              </VoxCard>
            </div>

            {/* Per-Vox document groups */}
            <div className="space-y-6">
              {voxesWithDocs.map((c: any) => (
                <VoxCard key={c.id} className="overflow-hidden">
                  {/* Vox header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400">
                        {c.id.split("-")[0].toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-slate-900">{c.category}</span>
                      <VoxBadge
                        tone={
                          c.status === "RESOLVED" || c.status === "CLOSED"
                            ? "resolved"
                            : c.status === "IN_PROGRESS"
                            ? "progress"
                            : c.status === "ESCALATED"
                            ? "p1"
                            : "open"
                        }
                        dot={c.status !== "RESOLVED" && c.status !== "CLOSED"}
                      >
                        {c.status.replace("_", " ")}
                      </VoxBadge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {format(new Date(c.created_at), "dd MMM yyyy")}
                    </span>
                  </div>

                  {/* Files grid */}
                  <div className="grid gap-3 p-5 sm:grid-cols-2">
                    {(c.attachments as string[]).map((url, idx) => {
                      const FileIcon = getFileIcon(url);
                      const fileType = getFileType(url);
                      const fileName = getFileName(url);
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "group flex items-center gap-3 rounded-lg border border-slate-200 p-3.5 transition-all",
                            "hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
                          )}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            <FileIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                              {fileName}
                            </p>
                            <p className="text-xs text-slate-400">{fileType}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                </VoxCard>
              ))}
            </div>
          </>
        )}
      </div>
    </VoxShell>
  );
}
