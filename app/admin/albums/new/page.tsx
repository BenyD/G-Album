"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Trash,
  CloudUpload,
  Database,
  CheckCircle2,
  X,
} from "lucide-react";
import { useRole } from "@/components/admin/role-context";
import type { UploadedImage } from "@/lib/types/albums";
import { createAlbum, uploadImage } from "@/lib/services/albums";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

const steps = [
  {
    title: "Album Details",
    icon: Database,
    description: "Set the basic information for your album",
  },
  {
    title: "Upload Images",
    icon: CloudUpload,
    description: "Add and arrange your album photos",
  },
  {
    title: "Review",
    icon: CheckCircle2,
    description: "Review and publish your album",
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
      <div className="h-full w-full rounded-lg border border-red-100 overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-md">
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Overlay controls */}
      {(onSetCover || onRemove) && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-red-900/20 to-transparent rounded-lg" />
          <div className="relative flex gap-3 scale-90 group-hover:scale-100 transition-transform duration-300">
            {onSetCover && (
              <button
                onClick={onSetCover}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300 shadow-lg",
                  isCover
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                    : "bg-white text-red-600 hover:bg-red-50"
                )}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-2.5 rounded-full bg-white text-red-600 hover:bg-red-50 transition-all duration-300 shadow-lg"
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cover badge */}
      {isCover && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
            Cover Image
          </Badge>
        </div>
      )}
    </div>
  );
}

export default function NewAlbumPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useRole();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Album Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  // Step 2: Image Upload
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [creationProgress, setCreationProgress] = useState<{
    status: "idle" | "uploading" | "creating" | "completed" | "error";
    progress: number;
    message: string;
  }>({
    status: "idle",
    progress: 0,
    message: "",
  });

  const handleImageUpload = useCallback(
    async (files: FileList) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        const validFiles = Array.from(files).filter((file) =>
          file.type.startsWith("image/")
        );

        if (validFiles.length === 0) {
          throw new Error("No valid image files selected");
        }

        const totalFiles = validFiles.length;
        const newImages: UploadedImage[] = [];

        for (let i = 0; i < totalFiles; i++) {
          const file = validFiles[i];
          const imageData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                resolve(reader.result);
              } else {
                reject(new Error("Failed to read file"));
              }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });

          newImages.push({
            id: `${Date.now()}-${i}`,
            file,
            preview: imageData,
            order_index: uploadedImages.length + i,
          });

          setUploadProgress(((i + 1) / totalFiles) * 100);
        }

        setUploadedImages((prev) => {
          // Filter out any potential duplicates based on file name and size
          const existingFileNames = new Set(
            prev.map((img) => img.file.name + img.file.size)
          );
          const uniqueNewImages = newImages.filter(
            (img) => !existingFileNames.has(img.file.name + img.file.size)
          );
          return [...prev, ...uniqueNewImages];
        });

        if (!coverImageId && newImages.length > 0) {
          setCoverImageId(newImages[0].id);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        toast({
          variant: "destructive",
          title: "Upload Error",
          description:
            error instanceof Error ? error.message : "Failed to upload images",
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [uploadedImages.length, coverImageId, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload]
  );

  const removeImage = useCallback(
    (imageId: string) => {
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
      if (coverImageId === imageId) {
        const remaining = uploadedImages.filter((img) => img.id !== imageId);
        setCoverImageId(remaining.length > 0 ? remaining[0].id : "");
      }
    },
    [uploadedImages, coverImageId]
  );

  if (!hasPermission("manage_albums")) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertTitle className="text-lg font-semibold">Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setCreationProgress({
        status: "uploading",
        progress: 0,
        message: "Preparing to upload images...",
      });

      // Check authentication status
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Authentication error:", authError);
        throw new Error("You must be authenticated to create an album");
      }

      // Check if user has the required permission
      if (!hasPermission("manage_albums")) {
        throw new Error("You don't have permission to create albums");
      }

      if (!title) {
        throw new Error("Please enter an album title");
      }

      if (uploadedImages.length === 0) {
        throw new Error("Please upload at least one image");
      }

      if (!coverImageId) {
        throw new Error("Please select a cover image");
      }

      // Upload images
      const totalImages = uploadedImages.length;
      const uploadedUrls: string[] = [];

      for (let i = 0; i < totalImages; i++) {
        const image = uploadedImages[i];
        setCreationProgress({
          status: "uploading",
          progress: (i / totalImages) * 50, // First 50% for uploads
          message: `Uploading image ${i + 1} of ${totalImages}...`,
        });

        const imageUrl = await uploadImage(image.file, `albums/${Date.now()}`);
        uploadedUrls.push(imageUrl);
      }

      setCreationProgress({
        status: "creating",
        progress: 50,
        message: "Creating album in database...",
      });

      // Create the album with the uploaded images
      const coverImageUrl =
        uploadedUrls[
          uploadedImages.findIndex((img) => img.id === coverImageId)
        ];

      await createAlbum({
        title,
        description,
        featured,
        cover_image_url: coverImageUrl,
        images: uploadedUrls.map((url, index) => ({
          image_url: url,
          order_index: index,
        })),
      });

      setCreationProgress({
        status: "completed",
        progress: 100,
        message: "Album created successfully!",
      });

      toast({
        title: "Success",
        description: "Album created successfully",
      });

      // Redirect after a short delay to show completion
      setTimeout(() => {
        router.push("/admin/albums");
      }, 1500);
    } catch (error) {
      console.error("Error creating album:", error);
      setCreationProgress({
        status: "error",
        progress: 0,
        message:
          error instanceof Error ? error.message : "Failed to create album",
      });
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create album",
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

    if (currentStep === 1 && uploadedImages.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload at least one image",
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
          <h1 className="text-2xl font-bold text-red-900">Create New Album</h1>
        </div>
        <div className="ml-9">
          <p className="text-muted-foreground">
            Follow the steps below to create a new photo album
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
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-all duration-300",
                    isDragging
                      ? "border-red-500 bg-red-50"
                      : "border-red-100 hover:border-red-200"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleImageUpload(e.dataTransfer.files);
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={cn(
                        "p-4 rounded-full transition-all duration-300",
                        isDragging ? "bg-red-100" : "bg-red-50"
                      )}
                    >
                      <Upload
                        className={cn(
                          "w-8 h-8 transition-colors duration-300",
                          isDragging ? "text-red-600" : "text-red-400"
                        )}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">
                        Drag & drop your images here, or{" "}
                        <label className="text-red-600 hover:text-red-700 cursor-pointer">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              e.target.files &&
                              handleImageUpload(e.target.files)
                            }
                          />
                        </label>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports: JPG, PNG, GIF (max 10MB each)
                      </p>
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Uploaded Images ({uploadedImages.length})
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedImages([])}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image) => (
                        <ImagePreview
                          key={image.id}
                          src={image.preview}
                          isCover={image.id === coverImageId}
                          onSetCover={() => setCoverImageId(image.id)}
                          onRemove={() =>
                            setUploadedImages((prev) =>
                              prev.filter((img) => img.id !== image.id)
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Album Details</h3>
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
                        {uploadedImages.length} uploaded
                      </span>
                    </div>
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Image Preview</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image) => (
                        <ImagePreview
                          key={image.id}
                          src={image.preview}
                          isCover={image.id === coverImageId}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
            disabled={
              (currentStep === 0 && !title) ||
              (currentStep === 1 && uploadedImages.length === 0) ||
              isSubmitting
            }
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Album
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

      {/* Creation Progress Modal */}
      <AnimatePresence>
        {creationProgress.status !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-lg font-medium mb-4">Creating Album</h3>
              <div className="space-y-4">
                <Progress value={creationProgress.progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {creationProgress.message}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
