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

const steps = ["Album Details", "Upload Images", "Review"];

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

  // Creation Progress Modal
  const CreationProgressModal = () => {
    if (!isSubmitting) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-3">
              {creationProgress.status === "uploading" && (
                <CloudUpload className="w-6 h-6 text-red-600 animate-bounce" />
              )}
              {creationProgress.status === "creating" && (
                <Database className="w-6 h-6 text-red-600 animate-pulse" />
              )}
              {creationProgress.status === "completed" && (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}
              {creationProgress.status === "error" && (
                <X className="w-6 h-6 text-red-600" />
              )}
              <h3 className="text-lg font-semibold">
                {creationProgress.status === "uploading" && "Uploading Images"}
                {creationProgress.status === "creating" && "Creating Album"}
                {creationProgress.status === "completed" && "Album Created"}
                {creationProgress.status === "error" && "Error"}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {creationProgress.message}
                </span>
                <span className="font-medium">
                  {Math.round(creationProgress.progress)}%
                </span>
              </div>
              <Progress
                value={creationProgress.progress}
                className={cn(
                  "h-2",
                  creationProgress.status === "completed"
                    ? "bg-green-600"
                    : creationProgress.status === "error"
                    ? "bg-red-600"
                    : "bg-gradient-to-r from-red-600 to-red-700"
                )}
              />
            </div>

            {creationProgress.status === "error" && (
              <div className="pt-2">
                <Button
                  onClick={() => setIsSubmitting(false)}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-900">Create New Album</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to create a new photo album
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Steps indicator */}
      <div className="relative pt-12 pb-8 px-4">
        {/* Progress line */}
        <div className="absolute top-[calc(3.25rem+1.25rem)] left-0 right-0 mx-4">
          <div className="absolute h-1 w-full bg-red-100 rounded-full top-1/2 -translate-y-1/2">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step circles */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative group mb-3 z-10",
                    isCurrent && "animate-pulse"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shadow-lg",
                      isCompleted
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white scale-100"
                        : isCurrent
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white scale-110 ring-4 ring-red-100"
                        : "bg-white border-2 border-red-100 text-red-600"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="relative z-10">{index + 1}</span>
                    )}
                  </div>
                  {/* Tooltip */}
                  <div
                    className={cn(
                      "absolute -top-12 left-1/2 -translate-x-1/2 bg-red-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200",
                      "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-red-900"
                    )}
                  >
                    {step}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    isCurrent
                      ? "text-red-900"
                      : isCompleted
                      ? "text-red-600"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <Card className="border border-red-100 shadow-lg">
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-red-900">
                      Album Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter album title"
                      className="border-red-100 focus:border-red-200 focus:ring-red-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-red-900">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter album description"
                      className="min-h-[100px] border-red-100 focus:border-red-200 focus:ring-red-100"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="featured" className="text-red-900">
                        Featured Album
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Featured albums appear on the homepage
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={featured}
                      onCheckedChange={setFeatured}
                      className="data-[state=checked]:bg-gradient-to-r from-red-600 to-red-700 data-[state=checked]:hover:from-red-700 data-[state=checked]:hover:to-red-800"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 transition-all duration-300",
                      isDragging
                        ? "border-red-500 bg-red-50"
                        : "border-red-100 hover:border-red-200"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="p-4 rounded-full bg-red-50">
                        <Upload className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-red-900">
                          Drag and drop your images here
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or click to browse from your computer
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files && handleImageUpload(e.target.files)
                        }
                        id="image-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        className="border-red-200 hover:bg-red-50"
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-600 font-medium">
                          Uploading...
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(uploadProgress)}%
                        </span>
                      </div>
                      <Progress
                        value={uploadProgress}
                        className="h-2 bg-red-100"
                      />
                    </div>
                  )}

                  {uploadedImages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-red-900">
                        Uploaded Images
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image) => (
                          <ImagePreview
                            key={image.id}
                            src={image.preview}
                            isCover={image.id === coverImageId}
                            onSetCover={() => setCoverImageId(image.id)}
                            onRemove={() => removeImage(image.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-red-900">Album Details</h3>
                    <div className="grid gap-4 p-4 bg-red-50/50 rounded-lg border border-red-100">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Title
                        </span>
                        <p className="font-medium text-red-900">{title}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Description
                        </span>
                        <p className="text-red-900">
                          {description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Status:
                        </span>
                        {featured ? (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                            Featured
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-600"
                          >
                            Standard
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-red-900">
                        Selected Images
                      </h3>
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
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        {currentStep > 0 ? (
          <Button
            onClick={prevStep}
            variant="outline"
            className="border-red-200 hover:bg-red-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
          disabled={
            (currentStep === 0 && !title) ||
            (currentStep === 1 && uploadedImages.length === 0) ||
            isSubmitting
          }
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
        >
          {isSubmitting ? (
            <>Creating Album...</>
          ) : currentStep === steps.length - 1 ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Create Album
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* Add the progress modal */}
      <CreationProgressModal />
    </div>
  );
}
