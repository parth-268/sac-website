import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadResult {
  url: string;
  path: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    file: File,
    folder: string = "general",
  ): Promise<UploadResult | null> => {
    setUploading(true);

    try {
      // 1. Sanitize the original filename to remove special characters
      const fileExt = file.name.split(".").pop();
      const cleanName = file.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 50);

      // 2. Generate a secure, unique filename
      const fileName = `${folder}/${crypto.randomUUID()}-${cleanName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload file: " + error.message);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("An error occurred during upload");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage.from("uploads").remove([path]);
      if (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete file");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Delete error:", err);
      return false;
    }
  };

  return { uploadFile, deleteFile, uploading };
};
