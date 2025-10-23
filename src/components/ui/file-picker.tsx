"use client";

import { useState, useRef } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export interface FilePickerProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  showPreview?: boolean;
  uploadButtonText?: string;
  helperText?: string;
}

export function FilePicker({
  accept = "image/*",
  multiple = true,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles,
  files,
  onFilesChange,
  disabled = false,
  loading = false,
  className = "",
  showPreview = true,
  uploadButtonText = "Upload",
  helperText,
}: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const isImage = (file: File) => file.type.startsWith("image/");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError("");
    const newFiles: FileWithPreview[] = [];

    // Check max files limit
    if (maxFiles && files.length + selectedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of Array.from(selectedFiles)) {
      // Check file size
      if (file.size > maxSize) {
        setError(
          `File "${file.name}" is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
        );
        continue;
      }

      // Create preview URL for images
      const preview = isImage(file) ? URL.createObjectURL(file) : "";
      newFiles.push({
        file,
        preview,
        id: crypto.randomUUID(),
      });
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFilesChange(files.filter((f) => f.id !== id));
    setError("");
  };

  const clearAll = () => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    onFilesChange([]);
    setError("");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File previews */}
      {showPreview && files.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="relative w-24 h-24 border rounded-lg overflow-hidden group"
            >
              {isImage(fileItem.file) ? (
                <Image
                  src={fileItem.preview}
                  alt={fileItem.file.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                  <FileIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1 px-1 truncate w-full text-center">
                    {fileItem.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(fileItem.id)}
                disabled={disabled || loading}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading || (maxFiles ? files.length >= maxFiles : false)}
          className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">{uploadButtonText}</span>
            </>
          )}
        </button>

        {files.length > 0 && (
          <div className="flex-1 space-y-2">
            <p className="text-sm text-gray-600">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={disabled || loading}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        disabled={disabled || loading}
        className="hidden"
      />

      {/* Helper text */}
      {(helperText || error) && (
        <p className={`text-xs ${error ? "text-red-600" : "text-gray-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
