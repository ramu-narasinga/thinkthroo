"use client";

import { useCallback, useState } from "react";

export interface PendingAttachment {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  uploading: boolean;
  error?: string;
}

async function uploadFile(file: File): Promise<string> {
  const timestamp = Date.now();
  const extension = file.type.split("/")[1] || "png";
  const filename = `issue-${timestamp}.${extension}`;

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file.type || "application/octet-stream",
      "x-vercel-filename": filename,
    },
    body: file,
  });

  if (!res.ok) throw new Error("Failed to upload image");
  const { url } = (await res.json()) as { url: string };
  return url;
}

export function useIssueAttachmentUpload() {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of list) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);
      setAttachments((prev) => [...prev, { id, file, previewUrl, uploading: true }]);

      uploadFile(file)
        .then((uploadedUrl) => {
          setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, uploadedUrl, uploading: false } : a)));
        })
        .catch(() => {
          setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, uploading: false, error: "Upload failed" } : a)));
        });
    }
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      return [];
    });
  }, []);

  const isUploading = attachments.some((a) => a.uploading);
  const resolved = attachments
    .filter((a) => a.uploadedUrl)
    .map((a) => ({ url: a.uploadedUrl!, fileName: a.file.name, contentType: a.file.type }));

  return { attachments, addFiles, removeAttachment, reset, isUploading, resolved };
}
