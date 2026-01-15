import { useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  folder = "general",
  label = "Image",
  className = "",
}: ImageUploadProps) => {
  const { uploadFile, uploading } = useFileUpload();
  const [previewUrl, setPreviewUrl] = useState<string>(value);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to storage
    const result = await uploadFile(file, folder);
    if (result) {
      onChange(result.url);
      setPreviewUrl(result.url);
      toast.success("Image uploaded successfully");
    } else {
      // Revert preview on failure
      setPreviewUrl(value);
    }

    // Cleanup local preview URL
    URL.revokeObjectURL(localPreview);
  };

  const handleRemove = () => {
    onChange("");
    setPreviewUrl("");
  };

  // Sync preview with value when it changes externally
  if (value !== previewUrl && !uploading) {
    setPreviewUrl(value);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className="flex flex-col gap-3">
        {/* Preview */}
        {previewUrl ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="h-32 w-32 flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload Image"}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Manual URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Or paste image URL..."
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewUrl(e.target.value);
            }}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
};
