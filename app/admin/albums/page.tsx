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
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AlbumsPage() {
  const router = useRouter();
  const { hasPermission } = useRole();
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "images">("recent");

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

  // Add sorting function
  const sortedAlbums = [...filteredAlbums].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "images":
        return (b.images?.length || 0) - (a.images?.length || 0);
      case "recent":
      default:
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
    }
  });

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

  return (
    <div className="container mx-auto space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative">
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight text-red-900">
            Albums
          </h1>
          <p className="text-muted-foreground">
            Create and manage your photo collections
          </p>
          <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
        </div>
        <Button
          onClick={() => router.push("/admin/albums/new")}
          size="default"
          className="relative group overflow-hidden bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500 to-red-600 group-hover:scale-105 transition-transform duration-300" />
          <span className="relative flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create New Album
          </span>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
              <Input
                type="search"
                placeholder="Search by title or description..."
                className="pl-10 bg-white/50 border-red-100 focus:border-red-200 focus:ring-red-100 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 self-end">
              <Tabs
                value={sortBy}
                onValueChange={(v) => setSortBy(v as typeof sortBy)}
                className="hidden md:block"
              >
                <TabsList className="bg-red-50">
                  <TabsTrigger
                    value="recent"
                    className="data-[state=active]:bg-white"
                  >
                    Recent
                  </TabsTrigger>
                  <TabsTrigger
                    value="title"
                    className="data-[state=active]:bg-white"
                  >
                    Title
                  </TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className="data-[state=active]:bg-white"
                  >
                    Most Images
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-sm text-red-600">
                {filteredAlbums.length}{" "}
                {filteredAlbums.length === 1 ? "album" : "albums"} found
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="animate-pulse border border-red-100 shadow-sm hover:shadow-md transition-all duration-300"
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
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <Image
                src="/G Album Logo (RED).png"
                alt="G Album Logo"
                width={48}
                height={48}
                className="opacity-50"
              />
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              {searchTerm ? "No Albums Found" : "Welcome to G Album!"}
            </h3>
            <p className="text-red-600/80 max-w-md mb-6">
              {searchTerm
                ? "No albums match your search criteria. Try adjusting your search terms or clear the search to see all albums."
                : "Start organizing your photos by creating your first album collection. It's easy to get started!"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => router.push("/admin/albums/new")}
                size="lg"
                className="relative group overflow-hidden bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500 to-red-600 group-hover:scale-105 transition-transform duration-300" />
                <span className="relative flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Album
                </span>
              </Button>
            )}
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                size="lg"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4"
          >
            {sortedAlbums.map((album, index) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group border border-red-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={album.cover_image_url || "/placeholder.svg"}
                      alt={album.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {album.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="default"
                          className="bg-red-600/90 text-white shadow-lg backdrop-blur-sm"
                        >
                          <Star className="w-3.5 h-3.5 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between group-hover:text-red-600 transition-colors duration-300">
                      <span className="text-lg font-semibold line-clamp-1">
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
                          className="bg-red-100 text-red-600 rounded-full px-3"
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <DeleteAlbumDialog
        album={albumToDelete}
        onClose={() => setAlbumToDelete(null)}
        onConfirm={() => albumToDelete && handleDelete(albumToDelete)}
      />
    </div>
  );
}
