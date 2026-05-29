"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  CloudUpload,
  Check,
  AlertCircle,
  Copy,
  Globe,
  Lock,
} from "lucide-react";

type UploadingFile = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  shareId?: string;
  isPublic?: boolean;
};

export function FileUploadZone({ onUploadComplete, uploaderId }: { onUploadComplete: () => void; uploaderId?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [makePublic, setMakePublic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const entry: UploadingFile = { id, name: file.name, size: file.size, progress: 0, status: "uploading" };

      setUploading((prev) => [...prev, entry]);

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isPublic", makePublic ? "true" : "false");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploading((prev) =>
            prev.map((f) => (f.id === id ? { ...f, progress: pct } : f))
          );
        }
      };

      const promise = new Promise<void>((resolve) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              setUploading((prev) =>
                prev.map((f) =>
                  f.id === id
                    ? { ...f, progress: 100, status: "done", shareId: response.file?.shareId, isPublic: response.file?.isPublic }
                    : f
                )
              );
            } catch {
              setUploading((prev) =>
                prev.map((f) => (f.id === id ? { ...f, progress: 100, status: "done" } : f))
              );
            }
            onUploadComplete();
          } else {
            // Try to extract the actual error message from the server
            let errorMsg = "Upload failed";
            try {
              const errBody = JSON.parse(xhr.responseText);
              if (errBody.error) errorMsg = errBody.error;
              else if (xhr.status === 413) errorMsg = "File too large (max 50MB)";
              else if (xhr.status === 503) errorMsg = "Service unavailable — try again later";
            } catch {
              if (xhr.status === 413) errorMsg = "File too large (max 50MB)";
              else if (xhr.status === 503) errorMsg = "Service unavailable — try again later";
            }
            setUploading((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: "error", error: errorMsg } : f
              )
            );
          }
          resolve();
        };
        xhr.onerror = () => {
          setUploading((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, status: "error", error: "Network error" } : f
            )
          );
          resolve();
        };
      });

      xhr.open("POST", "/api/files/upload");
      if (uploaderId) {
        xhr.setRequestHeader("x-uploader-id", uploaderId);
      }
      xhr.send(formData);

      await promise;
    },
    [onUploadComplete, uploaderId, makePublic]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(uploadFile);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(uploadFile);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadFile]
  );

  const removeUpload = useCallback((id: string) => {
    setUploading((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const copyShareLink = useCallback((shareId: string, fileId: string) => {
    const url = `${window.location.origin}?share=${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(fileId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const hasCompleted = uploading.some((f) => f.status === "done");

  return (
    <div className="flex flex-col gap-3">
      {/* Visibility toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Upload visibility</span>
        <button
          onClick={() => setMakePublic(!makePublic)}
          className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[11px] font-medium transition-colors ${
            makePublic
              ? "border-green-500/30 bg-green-500/10 text-green-500"
              : "border-border bg-card text-muted-foreground hover:border-foreground/20"
          }`}
        >
          {makePublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {makePublic ? "Public" : "Private"}
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed p-6 transition-all duration-200 ${
          isDragging
            ? "border-foreground/30 bg-foreground/[0.03]"
            : "border-border hover:border-foreground/20 hover:bg-foreground/[0.01]"
        }`}
      >
        <div
          className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
            isDragging ? "bg-foreground/10" : "bg-foreground/5"
          }`}
        >
          <CloudUpload className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            or click to browse — max 50MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload progress list — CSS-only animations */}
      {uploading.map((f) => (
        <div key={f.id} className="upload-item rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2.5">
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
              f.status === "done" ? "bg-green-500/10" : f.status === "error" ? "bg-red-500/10" : "bg-foreground/5"
            }`}>
              {f.status === "done" ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : f.status === "error" ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Upload className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium">{f.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/8">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${f.progress}%`,
                      background:
                        f.status === "error"
                          ? "oklch(0.6 0.2 25)"
                          : f.status === "done"
                          ? "oklch(0.7 0.16 140)"
                          : "linear-gradient(90deg, oklch(0.75 0.12 250 / 0.8), oklch(0.85 0.1 180 / 0.95))",
                    }}
                  />
                </div>
                <span className="text-[9px] tabular-nums text-muted-foreground">
                  {f.status === "done" ? "Done" : f.status === "error" ? "Failed" : `${f.progress}%`}
                </span>
              </div>
              {f.status === "error" && f.error && (
                <p className="text-[9px] text-red-500 mt-0.5 truncate">{f.error}</p>
              )}
            </div>
            <button
              onClick={() => removeUpload(f.id)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Success actions */}
          {f.status === "done" && f.shareId && (
            <div className="mt-2.5 flex items-center gap-2 pt-2.5 border-t border-border/50">
              <span className={`flex items-center gap-1 text-[10px] ${f.isPublic ? "text-green-500" : "text-amber-500"}`}>
                {f.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {f.isPublic ? "Public" : "Private"}
              </span>
              <div className="flex-1" />
              <button
                onClick={(e) => { e.stopPropagation(); copyShareLink(f.shareId!, f.id); }}
                className="flex items-center gap-1 h-6 px-2 rounded-md bg-foreground/5 text-[10px] text-foreground transition-colors hover:bg-foreground/10"
              >
                {copiedId === f.id ? (
                  <>
                    <Check className="h-2.5 w-2.5 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5" />
                    Copy link
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Hint */}
      {hasCompleted && (
        <p className="text-center text-[10px] text-muted-foreground">
          ✨ Switch to <strong>Files</strong> tab to manage uploads.
        </p>
      )}
    </div>
  );
}
