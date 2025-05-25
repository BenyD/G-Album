"use client"

import type React from "react"

import { useRole } from "@/components/admin/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Edit, Plus, Search, Info, Lock, Upload, X, Star } from "lucide-react"
import Image from "next/image"
import { RoleBasedContent } from "@/components/admin/role-based-content"
import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AlbumImage {
  id: string
  file: File
  preview: string
  order: number
}

interface Album {
  id: number
  name: string
  imageCount: number
  coverImage: string
  description?: string
  featured: boolean
  images: AlbumImage[]
}

export default function AlbumsPage() {
  const { role, hasPermission } = useRole()
  const { toast } = useToast()

  const [albums, setAlbums] = useState<Album[]>([
    {
      id: 1,
      name: "Luxury Album Pad",
      imageCount: 48,
      coverImage: "/wedding-album-cover.png",
      description: "Premium quality luxury album with finest materials",
      featured: true,
      images: [],
    },
    {
      id: 2,
      name: "Regular Album Pad",
      imageCount: 32,
      coverImage: "/birthday-album-cover.png",
      description: "Standard quality album for everyday memories",
      featured: false,
      images: [],
    },
    {
      id: 3,
      name: "Double Lock Box Album",
      imageCount: 24,
      coverImage: "/anniversary-album-cover.png",
      description: "Secure double lock box design for special occasions",
      featured: true,
      images: [],
    },
    {
      id: 4,
      name: "Roshe Album Pad",
      imageCount: 36,
      coverImage: "/placeholder-u1ygd.png",
      description: "Elegant Roshe design with premium finishing",
      featured: false,
      images: [],
    },
    {
      id: 5,
      name: "Miniature Album Pad",
      imageCount: 42,
      coverImage: "/placeholder.svg?height=400&width=400&query=baby album cover",
      description: "Compact size perfect for small collections",
      featured: false,
      images: [],
    },
    {
      id: 6,
      name: "Premium Album Pad",
      imageCount: 56,
      coverImage: "/placeholder.svg?height=400&width=400&query=travel album cover",
      description: "Top-tier premium album with exclusive features",
      featured: true,
      images: [],
    },
  ])

  // Create Album States
  const [createOpen, setCreateOpen] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumDescription, setNewAlbumDescription] = useState("")
  const [uploadedImages, setUploadedImages] = useState<AlbumImage[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Edit Album States
  const [editOpen, setEditOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [dragMode, setDragMode] = useState(false)
  const [draggedImage, setDraggedImage] = useState<string | null>(null)

  const canEditAlbums = hasPermission("edit_albums")

  // Handle bulk image upload
  const handleImageUpload = useCallback(
    (files: FileList) => {
      setIsUploading(true)
      setUploadProgress(0)

      const newImages: AlbumImage[] = []
      let processed = 0

      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const newImage: AlbumImage = {
              id: `${Date.now()}-${index}`,
              file,
              preview: e.target?.result as string,
              order: uploadedImages.length + newImages.length,
            }
            newImages.push(newImage)
            processed++

            const progress = (processed / files.length) * 100
            setUploadProgress(progress)

            if (processed === files.length) {
              setUploadedImages((prev) => [...prev, ...newImages])
              setIsUploading(false)
              setUploadProgress(100)
              setTimeout(() => setUploadProgress(0), 1000)
            }
          }
          reader.readAsDataURL(file)
        }
      })
    },
    [uploadedImages.length],
  )

  // Remove uploaded image
  const removeUploadedImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  // Create album
  const handleCreateAlbum = () => {
    if (!newAlbumName || uploadedImages.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide album name and upload at least one image.",
      })
      return
    }

    const newAlbum: Album = {
      id: albums.length + 1,
      name: newAlbumName,
      imageCount: uploadedImages.length,
      coverImage: uploadedImages[0]?.preview || "/placeholder.svg",
      description: newAlbumDescription,
      featured: false,
      images: uploadedImages,
    }

    setAlbums((prev) => [...prev, newAlbum])

    // Reset form
    setNewAlbumName("")
    setNewAlbumDescription("")
    setUploadedImages([])
    setCreateOpen(false)

    toast({
      title: "Success",
      description: "Album created successfully!",
    })
  }

  // Toggle featured status
  const toggleFeatured = (albumId: number) => {
    setAlbums((prev) => prev.map((album) => (album.id === albumId ? { ...album, featured: !album.featured } : album)))

    toast({
      title: "Success",
      description: "Album featured status updated!",
    })
  }

  // Open edit album
  const openEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setEditOpen(true)
  }

  // Handle drag and drop for image reordering
  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()
    if (!draggedImage || !editingAlbum) return

    const updatedImages = [...editingAlbum.images]
    const draggedIndex = updatedImages.findIndex((img) => img.id === draggedImage)
    const targetIndex = updatedImages.findIndex((img) => img.id === targetImageId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = updatedImages.splice(draggedIndex, 1)
      updatedImages.splice(targetIndex, 0, draggedItem)

      // Update order numbers
      updatedImages.forEach((img, index) => {
        img.order = index
      })

      setEditingAlbum({ ...editingAlbum, images: updatedImages })
    }
    setDraggedImage(null)
  }

  // Save album changes
  const saveAlbumChanges = () => {
    if (!editingAlbum) return

    setAlbums((prev) => prev.map((album) => (album.id === editingAlbum.id ? editingAlbum : album)))

    toast({
      title: "Success",
      description: "Album updated successfully!",
    })

    setEditOpen(false)
    setEditingAlbum(null)
    setDragMode(false)
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Album Management</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing as <strong>{role}</strong>.
          {canEditAlbums ? " You can create, edit, and manage albums." : " You have read-only access to albums."}
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Album Management</h2>
        <RoleBasedContent permissions={["edit_albums"]}>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Album
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
                <DialogDescription>Fill in the details and upload images to create a new album.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newAlbumDescription}
                    onChange={(e) => setNewAlbumDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Images
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  />
                  <Button variant="outline" asChild className="col-span-3">
                    <label htmlFor="image" className="cursor-pointer">
                      Select images
                    </label>
                  </Button>
                </div>

                {isUploading && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="progress" className="text-right">
                      Uploading
                    </Label>
                    <Progress id="progress" value={uploadProgress} className="col-span-3" />
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right">Preview</Label>
                    <div className="col-span-3 grid grid-cols-3 gap-4">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="relative">
                          <Image
                            src={image.preview || "/placeholder.svg"}
                            alt="Uploaded"
                            width={100}
                            height={100}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeUploadedImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" onClick={handleCreateAlbum}>
                  Create album
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </RoleBasedContent>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search albums..." className="pl-8" />
        </div>
      </div>

      {!canEditAlbums && (
        <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle>Read-Only Access</AlertTitle>
          <AlertDescription>
            You have read-only access to albums. Contact an administrator to request edit permissions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <Card key={album.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image src={album.coverImage || "/placeholder.svg"} alt={album.name} fill className="object-cover" />
              {album.featured && (
                <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{album.name}</CardTitle>
              <p className="text-sm text-gray-600">{album.imageCount} images</p>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => openEditAlbum(album)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Album Dialog Overlay */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Edit Album</DialogTitle>
            <DialogDescription>Modify album details, rearrange images, or add new ones.</DialogDescription>
          </DialogHeader>

          {editingAlbum && (
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 py-6">
                {/* Left Column - Album Details */}
                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-white rounded-lg border p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-red-600" />
                      Album Information
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-sm font-medium">
                          Album Name
                        </Label>
                        <Input
                          id="edit-name"
                          value={editingAlbum.name}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, name: e.target.value })}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="edit-description"
                          value={editingAlbum.description || ""}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                          className="w-full min-h-[120px]"
                          placeholder="Enter album description..."
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-linear-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-yellow-800">Featured Album</Label>
                          <p className="text-xs text-yellow-700">Display this album on the homepage</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star
                            className={`h-5 w-5 ${editingAlbum.featured ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                          />
                          <input
                            type="checkbox"
                            checked={editingAlbum.featured}
                            onChange={(e) => setEditingAlbum({ ...editingAlbum, featured: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-linear-to-br from-red-50 to-rose-50 rounded-lg border border-red-200 p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-red-900">Album Statistics</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg shadow-xs border">
                        <div className="text-3xl font-bold text-red-600">{editingAlbum.images.length}</div>
                        <div className="text-sm text-red-800 font-medium">Total Images</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-xs border">
                        <div
                          className={`text-3xl font-bold ${editingAlbum.featured ? "text-yellow-600" : "text-gray-400"}`}
                        >
                          {editingAlbum.featured ? "★" : "☆"}
                        </div>
                        <div className="text-sm text-gray-800 font-medium">Featured Status</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image Management */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg border p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Upload className="h-5 w-5 mr-2 text-red-600" />
                        Image Management
                      </h3>
                      <div className="flex space-x-3">
                        <Button
                          variant={dragMode ? "default" : "outline-solid"}
                          size="sm"
                          onClick={() => setDragMode(!dragMode)}
                          className={dragMode ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          {dragMode ? "Exit Arrange" : "Arrange Mode"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("edit-upload")?.click()}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Images
                        </Button>
                      </div>
                    </div>

                    <input
                      id="edit-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          const newImages: AlbumImage[] = Array.from(e.target.files).map((file, index) => ({
                            id: `${Date.now()}-${index}`,
                            file,
                            preview: URL.createObjectURL(file),
                            order: editingAlbum.images.length + index,
                          }))
                          setEditingAlbum({
                            ...editingAlbum,
                            images: [...editingAlbum.images, ...newImages],
                            imageCount: editingAlbum.images.length + newImages.length,
                          })
                        }
                      }}
                    />

                    {dragMode && (
                      <Alert className="bg-red-50 border-red-200">
                        <Info className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">Arrange Mode Active</AlertTitle>
                        <AlertDescription className="text-red-700">
                          Drag and drop images to rearrange their order in the album. The first image will be used as
                          the cover.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto p-2">
                      {editingAlbum.images.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative group ${dragMode ? "cursor-move" : ""} bg-gray-50 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            dragMode ? "hover:border-red-400 hover:shadow-lg" : "hover:border-gray-300"
                          } ${index === 0 ? "ring-2 ring-yellow-400 ring-opacity-50" : ""}`}
                          draggable={dragMode}
                          onDragStart={() => handleDragStart(image.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, image.id)}
                        >
                          <Image
                            src={image.preview || "/placeholder.svg"}
                            alt={`Album image ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-32 object-cover"
                          />

                          {/* Cover Badge */}
                          {index === 0 && (
                            <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900 text-xs">Cover</Badge>
                          )}

                          {/* Delete Button */}
                          {!dragMode && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const updatedImages = editingAlbum.images.filter((img) => img.id !== image.id)
                                setEditingAlbum({
                                  ...editingAlbum,
                                  images: updatedImages,
                                  imageCount: updatedImages.length,
                                })
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Drag Overlay */}
                          {dragMode && (
                            <div className="absolute inset-0 bg-red-600 bg-opacity-20 flex items-center justify-center">
                              <div className="text-white text-xs font-medium bg-red-600 px-2 py-1 rounded">
                                Drag to reorder
                              </div>
                            </div>
                          )}

                          {/* Image Number */}
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    {editingAlbum.images.length === 0 && (
                      <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">No images in this album</h4>
                        <p className="text-sm mb-4">Click "Add Images" to get started</p>
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById("edit-upload")?.click()}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Images
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t bg-white">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="px-6">
              Cancel
            </Button>
            <Button onClick={saveAlbumChanges} className="bg-red-600 hover:bg-red-700 px-6">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
