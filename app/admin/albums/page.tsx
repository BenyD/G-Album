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
    <div className="container mx-auto py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-red-900">
            Albums
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and manage your photo collections
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/albums/new")}
          size="lg"
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Album
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-red-50/50 border border-red-100 p-4 rounded-lg shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
          <Input
            type="search"
            placeholder="Search by title or description..."
            className="pl-10 h-11 bg-white border-red-100 focus:border-red-200 focus:ring-red-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-sm text-red-600 hidden md:block">
          {filteredAlbums.length}{" "}
          {filteredAlbums.length === 1 ? "album" : "albums"} found
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="animate-pulse border border-red-100 shadow-lg"
            >
              <div className="aspect-video bg-red-50 rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-red-50 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-red-50 rounded w-1/2 mb-2" />
                <div className="h-4 bg-red-50 rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAlbums.length === 0 ? (
        <Alert variant="default" className="bg-red-50 border-2 border-red-100">
          <Info className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-lg font-semibold text-red-900">
            No Albums Found
          </AlertTitle>
          <AlertDescription className="text-red-600 mt-1">
            {searchTerm
              ? "No albums match your search criteria. Try adjusting your search terms."
              : "Get started by creating your first album collection."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAlbums.map((album) => (
            <Card
              key={album.id}
              className="overflow-hidden group border border-red-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-video relative">
                <Image
                  src={album.cover_image_url || "/placeholder.svg"}
                  alt={album.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {album.featured && (
                  <div className="absolute top-3 right-3 scale-100 group-hover:scale-110 transition-transform duration-300">
                    <Badge
                      variant="default"
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                    >
                      <Star className="w-3.5 h-3.5 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-start justify-between group-hover:text-red-600 transition-colors duration-300">
                  <span className="text-xl font-semibold line-clamp-1">
                    {album.title}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {album.description || "No description provided"}
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 bg-red-50 text-red-600 border-red-100"
                  >
                    {album.images?.length || 0}{" "}
                    {album.images?.length === 1 ? "image" : "images"}
                  </Badge>
                  {album.featured && (
                    <Badge
                      variant="default"
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-3"
                    >
                      Featured
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Link href={`/albums/${album.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Link href={`/admin/albums/${album.id}`}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setAlbumToDelete(album)}
                  className="opacity-60 hover:opacity-100 transition-opacity duration-200 bg-red-600 hover:bg-red-700"
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
