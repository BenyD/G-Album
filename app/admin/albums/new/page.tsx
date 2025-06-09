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
  X,
} from "lucide-react";
import { useRole } from "@/components/admin/role-context";
import type { UploadedImage } from "@/lib/types/albums";
import {
  createAlbum,
  uploadImage,
  STORAGE_BUCKET,
} from "@/lib/services/albums";
import { cn } from "@/lib/utils";
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
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setUploadProgress(0);

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

      // Upload images to storage sequentially with progress tracking
      console.log(`Starting upload of ${uploadedImages.length} images...`);
      const imageUrls: string[] = [];
      const totalImages = uploadedImages.length;
      const failedUploads: { index: number; error: Error }[] = [];
      let successfulUploads = 0;

      // Calculate progress segments
      const uploadSegment = 85; // 85% of progress bar for uploads
      const albumCreationSegment = 15; // 15% for album creation

      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        try {
          // Update progress to show which image we're on
          const progressMessage = `Uploading image ${i + 1} of ${totalImages}`;
          console.log(progressMessage);

          // Calculate base progress for this image
          const baseProgress = (i / totalImages) * uploadSegment;
          setUploadProgress(baseProgress);

          // Upload with retries
          const url = await uploadImage(
            img.file,
            title.toLowerCase().replace(/\s+/g, "-")
          );

          imageUrls.push(url);
          successfulUploads++;

          // Calculate progress including successful upload
          const currentProgress =
            (successfulUploads / totalImages) * uploadSegment;
          setUploadProgress(currentProgress);

          console.log(
            `Successfully uploaded image ${i + 1}/${totalImages}: ${url}`
          );
        } catch (error) {
          console.error(
            `Failed to upload image ${i + 1}/${totalImages}:`,
            error
          );
          failedUploads.push({
            index: i,
            error: error instanceof Error ? error : new Error("Unknown error"),
          });

          // If we have any failed uploads, we should clean up and abort
          if (failedUploads.length > 0) {
            console.log("Cleaning up successful uploads due to failures...");
            for (const uploadedUrl of imageUrls) {
              try {
                const pathParts = new URL(uploadedUrl).pathname.split("/");
                const bucketIndex = pathParts.indexOf("albums");
                if (bucketIndex !== -1) {
                  const filePath = pathParts.slice(bucketIndex + 1).join("/");
                  await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove([filePath]);
                }
              } catch (cleanupError) {
                console.error(
                  "Error cleaning up uploaded image:",
                  cleanupError
                );
              }
            }
            throw new Error(
              `Failed to upload ${failedUploads.length} image(s). Please try again.`
            );
          }
        }
      }

      if (failedUploads.length > 0) {
        throw new Error(
          `Failed to upload ${failedUploads.length} image(s). Please try again.`
        );
      }

      // Start album creation phase
      setUploadProgress(uploadSegment);
      console.log("All images uploaded successfully, creating album...");

      // Get cover image URL
      const coverImage = uploadedImages.find((img) => img.id === coverImageId);
      if (!coverImage) {
        throw new Error("Cover image not found in uploaded images");
      }

      const coverImageUrl = imageUrls[uploadedImages.indexOf(coverImage)];
      if (!coverImageUrl) {
        throw new Error("Failed to get cover image URL");
      }

      const albumData = {
        title,
        description,
        featured,
        cover_image_url: coverImageUrl,
        images: imageUrls.map((url, index) => ({
          image_url: url,
          order_index: index,
        })),
      };

      console.log("Creating album with data:", albumData);

      // Create album with images
      const result = await createAlbum(albumData);
      console.log("Album created successfully:", result);

      // Update progress to include album creation
      setUploadProgress(uploadSegment + albumCreationSegment);

      // Short delay to show the completion state
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: `Album created successfully with ${successfulUploads} images!`,
      });

      router.push("/admin/albums");
    } catch (error) {
      console.error("Error creating album:", error);
      console.error(
        "Error details:",
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error
      );

      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create album. Please try again.",
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
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Album</h1>
        <div className="mt-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                    currentStep >= index
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {currentStep > index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-100">
                    <div
                      className="h-full bg-red-600 transition-all duration-200"
                      style={{
                        width: currentStep > index ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step} className="text-sm font-medium text-gray-500">
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Album Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter album title"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-base font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter album description"
                    className="min-h-[100px]"
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                  <Label htmlFor="featured" className="text-base font-medium">
                    Featured Album
                  </Label>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 transition-all duration-200",
                    isDragging
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-500"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files)
                    }
                  />
                  <label
                    htmlFor="images"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">
                      Upload Images
                    </h3>
                    <p className="text-gray-500 text-sm text-center mt-1">
                      Drag and drop your images here, or click to browse
                    </p>
                  </label>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="bg-gray-100" />
                    <p className="text-sm text-center text-gray-600">
                      Uploading {uploadProgress.toFixed(0)}%
                    </p>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-700">
                        Uploaded Images
                      </h3>
                      <p className="text-sm text-gray-500">
                        {uploadedImages.length} image
                        {uploadedImages.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {uploadedImages.map((image) => (
                        <ImagePreview
                          key={image.id}
                          src={image.preview}
                          isCover={coverImageId === image.id}
                          onSetCover={() => setCoverImageId(image.id)}
                          onRemove={() => removeImage(image.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {isSubmitting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading images and creating album...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Album Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p>
                        <span className="font-medium">Title:</span> {title}
                      </p>
                      <p>
                        <span className="font-medium">Description:</span>{" "}
                        {description || "No description"}
                      </p>
                      <p>
                        <span className="font-medium">Featured:</span>{" "}
                        {featured ? "Yes" : "No"}
                      </p>
                      <p>
                        <span className="font-medium">Number of Images:</span>{" "}
                        {uploadedImages.length}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Images Preview
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {uploadedImages.map((image) => (
                        <ImagePreview
                          key={image.id}
                          src={image.preview}
                          isCover={coverImageId === image.id}
                        />
                      ))}
                    </div>
                  </div>

                  {isSubmitting && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-700">
                          Creating Album
                        </h3>
                        <p className="text-sm text-gray-500">
                          {uploadProgress.toFixed(0)}% Complete
                        </p>
                      </div>
                      <Progress
                        value={uploadProgress}
                        className="bg-gray-200"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center",
                              uploadProgress > 0 && uploadProgress < 100
                                ? "bg-yellow-500"
                                : uploadProgress === 100
                                ? "bg-green-500"
                                : "bg-gray-300"
                            )}
                          >
                            {uploadProgress === 100 ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  uploadProgress > 0
                                    ? "bg-white"
                                    : "bg-gray-400"
                                )}
                              />
                            )}
                          </div>
                          <span
                            className={cn(
                              uploadProgress > 0
                                ? "text-gray-700"
                                : "text-gray-500"
                            )}
                          >
                            Uploading Images ({uploadedImages.length})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center",
                              uploadProgress === 100 && !isSubmitting
                                ? "bg-green-500"
                                : "bg-gray-300"
                            )}
                          >
                            {uploadProgress === 100 && !isSubmitting ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                            )}
                          </div>
                          <span
                            className={cn(
                              uploadProgress === 100
                                ? "text-gray-700"
                                : "text-gray-500"
                            )}
                          >
                            Creating Album
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
          className="border"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700">
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Creating Album...</span>
            ) : (
              <>
                Create Album
                <Check className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
