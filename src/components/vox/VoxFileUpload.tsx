import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, CheckCircle2, Loader2, X, Paperclip } from "lucide-react";

export type UploadState = "idle" | "loading" | "success" | "error";

interface VoxFileUploadProps {
  onFileSelected?: (file: File) => void;
  onUploadComplete?: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  /** UI state control */
  _forceState?: UploadState;
  _forceProgress?: number;
}

export function VoxFileUpload({
  onFileSelected,
  onUploadComplete,
  accept = "image/*,.pdf,.doc,.docx",
  maxSizeMB = 10,
  className,
  _forceState,
  _forceProgress,
}: VoxFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // State override
  const displayState = _forceState ?? state;
  const displayProgress = _forceProgress ?? progress;

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max size is ${maxSizeMB}MB.`);
      setState("error");
      return;
    }
    setFileName(file.name);
    setError(null);
    setState("loading");
    setProgress(0);
    onFileSelected?.(file);

    // Progress update
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 20 + 10);
      if (p >= 100) {
        clearInterval(interval);
        setProgress(100);
        setState("success");
        onUploadComplete?.(`mock://uploads/${file.name}`);
      } else {
        setProgress(p);
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("w-full", className)} role="region" aria-label="File upload">
      <input
        ref={inputRef}
        type="file"
        id="vox-file-upload-input"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Select file to upload"
        tabIndex={-1}
      />

      {displayState === "idle" && (
        <button
          type="button"
          id="vox-file-upload-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          aria-label="Drop zone: click or drag a file here to upload"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            dragging
              ? "border-slate-400 bg-slate-50"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50",
          )}
        >
          <Upload className="h-8 w-8 text-slate-300" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-700">
              Drop file here or{" "}
              <span className="text-blue-600 underline underline-offset-2">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {accept.split(",").map(a => a.trim()).join(", ")} · Max {maxSizeMB}MB
            </p>
          </div>
        </button>
      )}

      {(displayState === "loading") && (
        <div
          role="status"
          aria-label="Uploading file"
          aria-live="polite"
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
              <span className="truncate max-w-[200px] font-medium">{fileName}</span>
            </div>
            <span className="text-xs text-slate-500" aria-live="polite">
              {displayProgress}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuenow={displayProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-200"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      )}

      {(displayState === "success") && (
        <div
          role="status"
          aria-label="Upload complete"
          aria-live="polite"
          className="flex items-center justify-between rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-4"
        >
          <div className="flex items-center gap-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <Paperclip className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <span className="truncate max-w-[200px] font-medium">{fileName}</span>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Remove uploaded file"
            className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {(displayState === "error") && (
        <div
          role="alert"
          aria-label="Upload error"
          className="flex items-center justify-between rounded-lg border border-red-200/70 bg-red-50/50 p-4"
        >
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={reset}
            aria-label="Dismiss error"
            className="rounded p-1 text-red-500 hover:bg-red-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
