"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Trash,
  Database,
  CloudUpload,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { useRole } from "@/components/admin/role-context";
import type { Album, UploadedImage } from "@/lib/types/albums";
import {
  getAlbumById,
  updateAlbum,
  uploadImage,
  deleteImage,
} from "@/lib/services/albums";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    title: "Album Details",
    icon: Database,
    description: "Update the basic information",
  },
  {
    title: "Manage Images",
    icon: CloudUpload,
    description: "Add, remove, or reorder photos",
  },
  {
    title: "Review",
    icon: CheckCircle2,
    description: "Review and save changes",
  },
];

// Simple image preview component
function ImagePreview({
  src,
  isCover,
  onSetCover,
  onRemove,
}: {
  src: string;
  isCover: boolean;
  onSetCover?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative aspect-square">
      {/* Main image container */}
      <div className="h-full w-full rounded-lg border border-gray-200 overflow-hidden">
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Overlay controls */}
      {(onSetCover || onRemove) && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 bg-black/50 rounded-lg" />
          <div className="relative flex gap-2">
            {onSetCover && (
              <button
                onClick={onSetCover}
                className={cn(
                  "p-2 rounded-full",
                  isCover
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-2 rounded-full bg-white text-red-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cover badge */}
      {isCover && (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-medium rounded">
          Cover
        </div>
      )}
    </div>
  );
}

export default function EditAlbumPage() {
  const router = useRouter();
  const { albumId } = useParams();
  const { toast } = useToast();
  const { hasPermission } = useRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Step 1: Album Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  // Step 2: Image Management
  const [existingImages, setExistingImages] = useState<
    { id: string; image_url: string; order_index: number }[]
  >([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const loadAlbum = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAlbumById(albumId as string);
      setTitle(data.title);
      setDescription(data.description || "");
      setFeatured(data.featured || false);
      setExistingImages(data.images || []);
      setCoverImageUrl(data.cover_image_url || "");
    } catch (error) {
      console.error("Error loading album:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load album",
      });
      router.push("/admin/albums");
    } finally {
      setIsLoading(false);
    }
  }, [albumId, router, toast]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  if (!hasPermission("manage_albums")) {
    return (
      <Alert
        variant="destructive"
        className="max-w-lg mx-auto mt-8 animate-in fade-in slide-in-from-top-4"
      >
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto space-y-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-100" />
            <div className="h-8 bg-red-100 rounded w-1/4" />
          </div>
          <div className="h-2 bg-red-100 rounded w-full" />
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-40 bg-red-100 rounded" />
                <div className="h-4 bg-red-100 rounded w-3/4" />
                <div className="h-4 bg-red-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    const newImages: UploadedImage[] = [];
    let processed = 0;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: `new-${Date.now()}-${index}`,
            file,
            preview: e.target?.result as string,
            order_index:
              existingImages.length + uploadedImages.length + newImages.length,
          };
          newImages.push(newImage);
          processed++;

          const progress = (processed / files.length) * 100;
          setUploadProgress(progress);

          if (processed === files.length) {
            setUploadedImages((prev) => [...prev, ...newImages]);
            setIsUploading(false);
            setUploadProgress(0);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.image_url !== imageUrl)
    );
    setImagesToDelete((prev) => [...prev, imageUrl]);
    if (coverImageUrl === imageUrl) {
      const nextImage = existingImages.find(
        (img) => img.image_url !== imageUrl
      );
      setCoverImageUrl(nextImage?.image_url || "");
    }
  };

  const removeNewImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!title) {
        throw new Error("Please fill in the album title");
      }

      // Upload new images
      const uploadPromises = uploadedImages.map((img) =>
        uploadImage(img.file, title.toLowerCase().replace(/\s+/g, "-"))
      );
      const newImageUrls = await Promise.all(uploadPromises);

      // Delete removed images
      await Promise.all(imagesToDelete.map((url) => deleteImage(url)));

      // Update album
      await updateAlbum(albumId as string, {
        title,
        description,
        featured,
        cover_image_url: coverImageUrl,
        images: [
          ...existingImages.map((img) => ({
            image_url: img.image_url,
            order_index: img.order_index,
          })),
          ...newImageUrls.map((url, index) => ({
            image_url: url,
            order_index: existingImages.length + index,
          })),
        ],
      });

      toast({
        title: "Success",
        description: "Album updated successfully!",
      });

      router.push("/admin/albums");
    } catch (error) {
      console.error("Error updating album:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update album",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 0 && !title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an album title",
      });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="container max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-600">
          <button
            onClick={() => router.back()}
            className="hover:bg-red-50 p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-red-900">Edit Album</h1>
        </div>
        <div className="ml-9">
          <p className="text-muted-foreground">
            Make changes to your album and save when done
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-[22px] h-0.5 bg-red-100" />
        <div
          className="absolute left-0 top-[22px] h-0.5 bg-red-600 transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center gap-2 transition-opacity duration-300",
                  index > currentStep && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                    index <= currentStep
                      ? "bg-red-600 text-white shadow-lg shadow-red-100"
                      : "bg-red-50 text-red-300"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {currentStep === 0 ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">
                    Album Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter album title..."
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your album..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <Label htmlFor="featured" className="text-base">
                      Featured Album
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display this album on the homepage
                    </p>
                  </div>
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                </div>
              </div>
            ) : currentStep === 1 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Images</h3>
                    <p className="text-sm text-muted-foreground">
                      {existingImages.length} images in album
                    </p>
                  </div>
                  <label className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4" />
                    Add Images
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files && handleImageUpload(e.target.files)
                      }
                    />
                  </label>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading new images...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image) => (
                    <ImagePreview
                      key={image.id}
                      src={image.image_url}
                      isCover={image.image_url === coverImageUrl}
                      onSetCover={() => setCoverImageUrl(image.image_url)}
                      onRemove={() => removeExistingImage(image.image_url)}
                    />
                  ))}
                  {uploadedImages.map((image) => (
                    <ImagePreview
                      key={image.id}
                      src={image.preview}
                      isCover={false}
                      onRemove={() => removeNewImage(image.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Review Changes</h3>
                  <div className="bg-red-50/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium">{title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description</span>
                      <span className="font-medium">
                        {description || "No description"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Featured</span>
                      <span className="font-medium">
                        {featured ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images</span>
                      <span className="font-medium">
                        {existingImages.length + uploadedImages.length} total
                      </span>
                    </div>
                    {imagesToDelete.length > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>To be removed</span>
                        <span>{imagesToDelete.length} images</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image) => (
                    <ImagePreview
                      key={image.id}
                      src={image.image_url}
                      isCover={image.image_url === coverImageUrl}
                    />
                  ))}
                  {uploadedImages.map((image) => (
                    <ImagePreview
                      key={image.id}
                      src={image.preview}
                      isCover={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-red-100 p-4 bg-red-50/30">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            disabled={currentStep === 0 && !title}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
