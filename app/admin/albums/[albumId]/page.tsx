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

const steps = ["Album Details", "Manage Images", "Review"];

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
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
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
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Album</h1>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center ${
                  index < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= index
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
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
              <span key={step} className="text-sm text-gray-600 font-medium">
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Album Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter album title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter album description"
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                  <Label htmlFor="featured">Featured Album</Label>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
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
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-gray-600 font-medium">
                      Click to upload new images
                    </span>
                    <span className="text-gray-400 text-sm mt-1">
                      or drag and drop them here
                    </span>
                  </label>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-gray-600 text-center">
                      Uploading images...
                    </p>
                  </div>
                )}

                {/* Existing Images Section */}
                {existingImages.length > 0 && (
                  <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Existing Images
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {existingImages.length} image
                          {existingImages.length !== 1 ? "s" : ""} in this album
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const firstImage = existingImages[0];
                            if (firstImage) {
                              setCoverImageUrl(firstImage.image_url);
                            }
                          }}
                          disabled={existingImages.length === 0}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Set First as Cover
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {existingImages.map((image, index) => (
                        <div
                          key={image.image_url}
                          className="bg-white rounded-lg shadow-sm border"
                        >
                          <div className="relative">
                            <ImagePreview
                              src={image.image_url}
                              isCover={coverImageUrl === image.image_url}
                              onSetCover={() =>
                                setCoverImageUrl(image.image_url)
                              }
                              onRemove={() =>
                                removeExistingImage(image.image_url)
                              }
                            />
                            <div className="absolute top-2 left-2">
                              <Badge
                                variant="secondary"
                                className="bg-white/90"
                              >
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 border-t">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {coverImageUrl === image.image_url ? (
                                  <Badge className="bg-red-600">
                                    Cover Image
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7"
                                    onClick={() =>
                                      setCoverImageUrl(image.image_url)
                                    }
                                  >
                                    Set as Cover
                                  </Button>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  removeExistingImage(image.image_url)
                                }
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Section */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-700">
                        New Images
                      </h3>
                      <p className="text-sm text-gray-500">
                        {uploadedImages.length} image
                        {uploadedImages.length !== 1 ? "s" : ""} to be added
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
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
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Album Details</h3>
                    <div className="mt-2 space-y-2">
                      <p>
                        <span className="font-medium">Title:</span> {title}
                      </p>
                      <p>
                        <span className="font-medium">Description:</span>{" "}
                        {description || "None"}
                      </p>
                      <p>
                        <span className="font-medium">Featured:</span>{" "}
                        {featured ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Images Preview
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {existingImages.map((image) => (
                        <ImagePreview
                          key={image.image_url}
                          src={image.image_url}
                          isCover={coverImageUrl === image.image_url}
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
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating Album..." : "Update Album"}
          </Button>
        )}
      </div>
    </div>
  );
}
