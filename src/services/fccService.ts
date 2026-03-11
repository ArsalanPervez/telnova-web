import { api } from "@/lib/axios";
import { ApiResponse } from "@/types";

export interface FccUploadResult {
  file: string;
  state: string;
  technologies: string[];
  raw_rows: number;
  zip_providers: number;
  inserted: number;
  replaced: number;
}

export const fccService = {
  upload: (file: File, state?: string, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    if (state) formData.append("state", state);

    return api.post<ApiResponse<FccUploadResult>>("/fcc/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
  },
};
