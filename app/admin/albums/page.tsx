"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/admin/role-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Info, Star, Eye, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Album } from "@/lib/types/albums";
import { getAlbums, deleteAlbum } from "@/lib/services/albums";
import { DeleteAlbumDialog } from "@/components/admin/albums/delete-album-dialog";
import Link from "next/link";

export default function AlbumsPage() {
  const router = useRouter();
  const { hasPermission } = useRole();
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);

  const loadAlbums = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAlbums();
      setAlbums(data);
    } catch (error) {
      console.error("Error loading albums:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load albums",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleDelete = async (album: Album) => {
    try {
      await deleteAlbum(album.id);
      toast({
        title: "Success",
        description: "Album deleted successfully",
      });
      loadAlbums();
      setAlbumToDelete(null);
    } catch (error) {
      console.error("Error deleting album:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete album",
      });
    }
  };

  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Albums</h1>
          <p className="text-muted-foreground mt-1">
            Manage your photo albums here
          </p>
        </div>
        <Button onClick={() => router.push("/admin/albums/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Album
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search albums..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAlbums.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Albums Found</AlertTitle>
          <AlertDescription>
            {searchTerm
              ? "No albums match your search criteria"
              : "Start by creating your first album"}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <Card key={album.id} className="overflow-hidden group">
              <div className="aspect-video relative">
                <Image
                  src={album.cover_image_url || "/placeholder.svg"}
                  alt={album.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {album.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-red-600">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <Link href={`/albums/${album.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <Link href={`/admin/albums/${album.id}`}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg font-semibold line-clamp-1">
                    {album.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {album.description || "No description"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">
                    {album.images?.length || 0} images
                  </Badge>
                  {album.featured && (
                    <Badge variant="default" className="bg-red-600">
                      Featured
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setAlbumToDelete(album)}
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <DeleteAlbumDialog
        open={!!albumToDelete}
        onOpenChange={(open) => !open && setAlbumToDelete(null)}
        onConfirm={() => albumToDelete && handleDelete(albumToDelete)}
        albumTitle={albumToDelete?.title || ""}
      />
    </div>
  );
}
