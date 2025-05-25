"use client"

import { useRole } from "@/components/admin/role-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Filter, Search, Info, Lock, Eye, EyeOff, CheckSquare, X, Settings } from "lucide-react"
import Image from "next/image"
import { RoleBasedContent } from "@/components/admin/role-based-content"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface GalleryImage {
  id: string
  src: string
  alt: string
  albumName: string
  albumId: number
  uploadDate: string
  order: number
  isVisible: boolean
  isSelected?: boolean
}

export default function GalleryPage() {
  const { role, hasPermission } = useRole()
  const { toast } = useToast()

  // Album names that serve as tags
  const albumTags = [
    "Luxury Album Pad",
    "Regular Album Pad",
    "Double Lock Box Album",
    "Roshe Album Pad",
    "Miniature Album Pad",
    "Premium Album Pad",
  ]

  // Sample gallery images linked to albums with visibility state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([
    // Luxury Album Pad images
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `luxury-${i + 1}`,
      src: `/placeholder.svg?height=400&width=400&query=luxury album photo ${i + 1}`,
      alt: `Luxury Album Photo ${i + 1}`,
      albumName: "Luxury Album Pad",
      albumId: 1,
      uploadDate: new Date(2024, 0, i + 1).toLocaleDateString(),
      order: i,
      isVisible: i < 6, // Some images hidden for demo
      isSelected: false,
    })),
    // Regular Album Pad images
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `regular-${i + 1}`,
      src: `/placeholder.svg?height=400&width=400&query=regular album photo ${i + 1}`,
      alt: `Regular Album Photo ${i + 1}`,
      albumName: "Regular Album Pad",
      albumId: 2,
      uploadDate: new Date(2024, 0, i + 10).toLocaleDateString(),
      order: i,
      isVisible: true,
      isSelected: false,
    })),
    // Double Lock Box Album images
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `double-lock-${i + 1}`,
      src: `/placeholder.svg?height=400&width=400&query=double lock box album photo ${i + 1}`,
      alt: `Double Lock Box Album Photo ${i + 1}`,
      albumName: "Double Lock Box Album",
      albumId: 3,
      uploadDate: new Date(2024, 0, i + 20).toLocaleDateString(),
      order: i,
      isVisible: i !== 2, // One image hidden for demo
      isSelected: false,
    })),
    // Roshe Album Pad images
    ...Array.from({ length: 7 }, (_, i) => ({
      id: `roshe-${i + 1}`,
      src: `/placeholder.svg?height=400&width=400&query=roshe album photo ${i + 1}`,
      alt: `Roshe Album Photo ${i + 1}`,
      albumName: "Roshe Album Pad",
      albumId: 4,
      uploadDate: new Date(2024, 1, i + 1).toLocaleDateString(),
      order: i,
      isVisible: true,
      isSelected: false,
    })),
    // Miniature Album Pad images
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `miniature-${i + 1}`,
      src: `/placeholder.svg?height=400&width=400&query=miniature album photo ${i + 1}`,
      alt: `Miniature Album Photo ${i + 1}`,
      albumName: "Miniature Album Pad",
      albumId: 5,
      uploadDate: new Date(2024, 1, i + 10).toLocaleDateString(),
      order: i,
      isVisible: i < 3, // One image hidden for demo
      isSelected: false,
    })),
    // Premium Album Pad images
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `premium-${i + 1}`,
      src: `/placeholder.svg?height=400&width=400&query=premium album photo ${i + 1}`,
      alt: `Premium Album Photo ${i + 1}`,
      albumName: "Premium Album Pad",
      albumId: 6,
      uploadDate: new Date(2024, 1, i + 20).toLocaleDateString(),
      order: i,
      isVisible: true,
      isSelected: false,
    })),
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)

  const canEditGallery = hasPermission("upload_gallery")

  // Get visible and hidden images
  const visibleImages = galleryImages.filter((img) => img.isVisible)
  const hiddenImages = galleryImages.filter((img) => !img.isVisible)
  const selectedImages = galleryImages.filter((img) => img.isSelected)

  // Filter images based on search and album selection
  const getFilteredImages = (images: GalleryImage[]) => {
    return images.filter((image) => {
      const matchesSearch =
        searchQuery === "" ||
        image.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.albumName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAlbum = selectedAlbum === "all" || image.albumName === selectedAlbum

      return matchesSearch && matchesAlbum
    })
  }

  const filteredVisibleImages = getFilteredImages(visibleImages)
  const filteredHiddenImages = getFilteredImages(hiddenImages)

  // Group images by album for better organization
  const getImagesByAlbum = (images: GalleryImage[]) => {
    return albumTags.reduce(
      (acc, albumName) => {
        acc[albumName] = images.filter((img) => img.albumName === albumName)
        return acc
      },
      {} as Record<string, GalleryImage[]>,
    )
  }

  // Toggle image visibility
  const toggleImageVisibility = (imageId: string) => {
    setGalleryImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, isVisible: !img.isVisible, isSelected: false } : img)),
    )

    const image = galleryImages.find((img) => img.id === imageId)
    toast({
      title: "Success",
      description: `Image ${image?.isVisible ? "hidden" : "shown"} successfully!`,
    })
  }

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    setGalleryImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, isSelected: !img.isSelected } : img)))
  }

  // Select all visible images
  const selectAllVisible = () => {
    const allSelected = filteredVisibleImages.every((img) => img.isSelected)
    setGalleryImages((prev) =>
      prev.map((img) =>
        filteredVisibleImages.some((filtered) => filtered.id === img.id) ? { ...img, isSelected: !allSelected } : img,
      ),
    )
  }

  // Bulk hide selected images
  const bulkHideSelected = () => {
    const selectedCount = selectedImages.length
    setGalleryImages((prev) =>
      prev.map((img) => (img.isSelected ? { ...img, isVisible: false, isSelected: false } : img)),
    )
    setBulkSelectMode(false)
    toast({
      title: "Success",
      description: `${selectedCount} images hidden successfully!`,
    })
  }

  // Bulk unhide selected images
  const bulkUnhideSelected = () => {
    const selectedCount = selectedImages.length
    setGalleryImages((prev) =>
      prev.map((img) => (img.isSelected ? { ...img, isVisible: true, isSelected: false } : img)),
    )
    setBulkSelectMode(false)
    toast({
      title: "Success",
      description: `${selectedCount} images shown successfully!`,
    })
  }

  // Clear all selections
  const clearSelections = () => {
    setGalleryImages((prev) => prev.map((img) => ({ ...img, isSelected: false })))
    setBulkSelectMode(false)
  }

  // Preview image function
  const previewImage = (image: GalleryImage) => {
    setSelectedImage(image)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Gallery Management</AlertTitle>
          <AlertDescription className="text-blue-700">
            You are viewing as <strong>{role}</strong>.
            {canEditGallery
              ? " You can view, hide, and show gallery images. All images are synced from albums."
              : " You have read-only access to the gallery."}
          </AlertDescription>
        </Alert>

        {/* Page Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Gallery Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage visibility of images synced from your albums</p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">{visibleImages.length}</div>
                  <div className="text-xs text-green-600">Visible</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-700">{hiddenImages.length}</div>
                  <div className="text-xs text-red-600">Hidden</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-700">{galleryImages.length}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bulk Selection Mode Banner */}
      {bulkSelectMode && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">Bulk Selection Mode</div>
                  <div className="text-sm text-blue-700">
                    {selectedImages.length} image{selectedImages.length !== 1 ? "s" : ""} selected
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={selectAllVisible}>
                  {filteredVisibleImages.every((img) => img.isSelected) ? "Deselect All" : "Select All Visible"}
                </Button>
                <RoleBasedContent permissions={["upload_gallery"]}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkHideSelected}
                    disabled={selectedImages.length === 0}
                    className="text-red-600 hover:text-red-700"
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Selected
                  </Button>
                </RoleBasedContent>
                <Button variant="outline" size="sm" onClick={clearSelections}>
                  <X className="h-4 w-4 mr-2" />
                  Exit Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Primary Controls Row */}
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {/* Action Button */}
              <RoleBasedContent permissions={["upload_gallery"]}>
                <Button
                  variant={bulkSelectMode ? "default" : "outline"}
                  onClick={() => setBulkSelectMode(!bulkSelectMode)}
                  className="w-full lg:w-auto"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {bulkSelectMode ? "Exit Selection" : "Bulk Select"}
                </Button>
              </RoleBasedContent>
            </div>

            <Separator />

            {/* Search and Filter Row */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Search & Filter</span>
              </div>

              <div className="flex flex-1 flex-col space-y-3 sm:flex-row sm:space-y-0 sm:gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search images by name or album..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Album Filter */}
                <div className="w-full sm:w-auto sm:min-w-[200px]">
                  <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                    <SelectTrigger className="w-full">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by album" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center justify-between w-full">
                          <span>All Albums</span>
                          <Badge variant="secondary" className="ml-2">
                            {galleryImages.length}
                          </Badge>
                        </div>
                      </SelectItem>
                      {albumTags.map((albumName) => {
                        const count = galleryImages.filter((img) => img.albumName === albumName).length
                        return (
                          <SelectItem key={albumName} value={albumName}>
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{albumName}</span>
                              <Badge variant="secondary" className="ml-2">
                                {count}
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedAlbum !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedAlbum("all")
                    }}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="visible" className="space-y-6">
        {/* Tabs Navigation */}
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto">
            <TabsTrigger value="visible" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Visible ({visibleImages.length})</span>
              <span className="sm:hidden">Visible</span>
            </TabsTrigger>
            <TabsTrigger value="hidden" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Hidden ({hiddenImages.length})</span>
              <span className="sm:hidden">Hidden</span>
            </TabsTrigger>
            <TabsTrigger value="by-album" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">By Album</span>
              <span className="sm:hidden">Albums</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Recently Added</span>
              <span className="sm:hidden">Recent</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visible" className="space-y-4">
          {!canEditGallery && (
            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertTitle>Read-Only Access</AlertTitle>
              <AlertDescription>
                You have read-only access to the gallery. Contact an administrator to request edit permissions.
              </AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredVisibleImages.length}</span> of{" "}
              <span className="font-semibold">{visibleImages.length}</span> visible images
              {selectedAlbum !== "all" && (
                <span>
                  {" "}
                  from <span className="font-semibold">{selectedAlbum}</span>
                </span>
              )}
            </p>
            {filteredVisibleImages.length > 0 && (
              <div className="text-xs text-gray-500">
                {Math.ceil(filteredVisibleImages.length / 20)} page
                {Math.ceil(filteredVisibleImages.length / 20) !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredVisibleImages.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {bulkSelectMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                      checked={image.isSelected}
                      onCheckedChange={() => toggleImageSelection(image.id)}
                      className="bg-white border-2 h-5 w-5 shadow-sm"
                    />
                  </div>
                )}
                <div className="relative aspect-square">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                    <span className="hidden sm:inline">
                      {image.albumName.replace(" Album Pad", "").replace(" Album", "")}
                    </span>
                    <span className="sm:hidden">
                      {image.albumName.replace(" Album Pad", "").replace(" Album", "").substring(0, 3)}
                    </span>
                  </Badge>
                </div>
                {!bulkSelectMode && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => previewImage(image)}
                        className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">Preview</span>
                      </Button>
                      <RoleBasedContent permissions={["upload_gallery"]} fallback={null}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleImageVisibility(image.id)}
                          className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                        >
                          <EyeOff className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">Hide</span>
                        </Button>
                      </RoleBasedContent>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-600 truncate font-medium">{image.alt}</p>
                  <p className="text-xs text-gray-500 mt-1">{image.uploadDate}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredVisibleImages.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-40 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No visible images found</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery || selectedAlbum !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Images will appear here when uploaded through albums and made visible"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hidden" className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredHiddenImages.length}</span> of{" "}
              <span className="font-semibold">{hiddenImages.length}</span> hidden images
            </p>
          </div>

          {/* Bulk Actions for Hidden Images */}
          {bulkSelectMode && hiddenImages.some((img) => img.isSelected) && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <span className="text-sm font-medium text-green-800">
                    {hiddenImages.filter((img) => img.isSelected).length} hidden image
                    {hiddenImages.filter((img) => img.isSelected).length !== 1 ? "s" : ""} selected
                  </span>
                  <RoleBasedContent permissions={["upload_gallery"]}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={bulkUnhideSelected}
                      disabled={hiddenImages.filter((img) => img.isSelected).length === 0}
                      className="w-full sm:w-auto text-green-600 hover:text-green-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Show Selected
                    </Button>
                  </RoleBasedContent>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hidden Images Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredHiddenImages.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-lg overflow-hidden border bg-white opacity-60 shadow-sm hover:shadow-md transition-all"
              >
                {bulkSelectMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                      checked={image.isSelected}
                      onCheckedChange={() => toggleImageSelection(image.id)}
                      className="bg-white border-2 h-5 w-5 shadow-sm"
                    />
                  </div>
                )}
                <div className="relative aspect-square">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <Badge className="absolute top-2 left-2 bg-gray-600 text-white text-xs">Hidden</Badge>
                  <Badge className="absolute bottom-2 left-2 bg-red-600 text-white text-xs">
                    <span className="hidden sm:inline">
                      {image.albumName.replace(" Album Pad", "").replace(" Album", "")}
                    </span>
                    <span className="sm:hidden">
                      {image.albumName.replace(" Album Pad", "").replace(" Album", "").substring(0, 3)}
                    </span>
                  </Badge>
                </div>
                {!bulkSelectMode && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => previewImage(image)}
                        className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">Preview</span>
                      </Button>
                      <RoleBasedContent permissions={["upload_gallery"]} fallback={null}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleImageVisibility(image.id)}
                          className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">Show</span>
                        </Button>
                      </RoleBasedContent>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-600 truncate font-medium">{image.alt}</p>
                  <p className="text-xs text-gray-500 mt-1">{image.uploadDate}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredHiddenImages.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-40 p-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <EyeOff className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No hidden images found</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery || selectedAlbum !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Hidden images will appear here when you hide them from the visible gallery"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="by-album" className="space-y-6">
          {albumTags.map((albumName) => {
            const albumImages = galleryImages.filter((img) => img.albumName === albumName)
            const visibleCount = albumImages.filter((img) => img.isVisible).length
            const hiddenCount = albumImages.filter((img) => !img.isVisible).length

            return (
              <Card key={albumName}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">{albumName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {albumImages.length} total image{albumImages.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {visibleCount} visible
                      </Badge>
                      {hiddenCount > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {hiddenCount} hidden
                        </Badge>
                      )}
                    </div>
                  </div>

                  {albumImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3">
                      {albumImages.map((image) => (
                        <div
                          key={image.id}
                          className={`group relative rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all ${!image.isVisible ? "opacity-60" : ""}`}
                        >
                          <div className="relative aspect-square">
                            <Image
                              src={image.src || "/placeholder.svg"}
                              alt={image.alt}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            {!image.isVisible && (
                              <Badge className="absolute top-1 left-1 bg-gray-600 text-white text-xs">Hidden</Badge>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => previewImage(image)}
                                className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <RoleBasedContent permissions={["upload_gallery"]} fallback={null}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleImageVisibility(image.id)}
                                  className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                                >
                                  {image.isVisible ? (
                                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                                  ) : (
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  )}
                                </Button>
                              </RoleBasedContent>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 border border-dashed rounded-lg bg-gray-50">
                      <p className="text-gray-500">No images in this album</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {galleryImages
              .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
              .slice(0, 20)
              .map((image) => (
                <div
                  key={image.id}
                  className={`group relative rounded-lg overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all ${!image.isVisible ? "opacity-60" : ""}`}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                      <span className="hidden sm:inline">
                        {image.albumName.replace(" Album Pad", "").replace(" Album", "")}
                      </span>
                      <span className="sm:hidden">
                        {image.albumName.replace(" Album Pad", "").replace(" Album", "").substring(0, 3)}
                      </span>
                    </Badge>
                    {!image.isVisible && (
                      <Badge className="absolute top-2 right-2 bg-gray-600 text-white text-xs">Hidden</Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => previewImage(image)}
                        className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">Preview</span>
                      </Button>
                      <RoleBasedContent permissions={["upload_gallery"]} fallback={null}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleImageVisibility(image.id)}
                          className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                        >
                          {image.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only sm:not-sr-only sm:ml-2 hidden sm:inline">
                            {image.isVisible ? "Hide" : "Show"}
                          </span>
                        </Button>
                      </RoleBasedContent>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 truncate font-medium">{image.alt}</p>
                    <p className="text-xs text-gray-500 mt-1">{image.uploadDate}</p>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Responsive Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Image Preview</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedImage?.albumName} - {selectedImage?.alt}
              {selectedImage && !selectedImage.isVisible && (
                <Badge className="ml-2 bg-gray-600 text-white">Hidden</Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full max-h-[60vh]">
                <Image
                  src={selectedImage.src || "/placeholder.svg"}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p>
                    <strong>Album:</strong> {selectedImage.albumName}
                  </p>
                  <p>
                    <strong>Upload Date:</strong> {selectedImage.uploadDate}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={selectedImage.isVisible ? "text-green-600" : "text-red-600"}>
                      {selectedImage.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <strong>Image ID:</strong> {selectedImage.id}
                  </p>
                  <p>
                    <strong>Order:</strong> #{selectedImage.order + 1}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                <RoleBasedContent permissions={["upload_gallery"]}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleImageVisibility(selectedImage.id)
                      setPreviewOpen(false)
                    }}
                    className="w-full sm:w-auto"
                  >
                    {selectedImage.isVisible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide Image
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show Image
                      </>
                    )}
                  </Button>
                </RoleBasedContent>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
