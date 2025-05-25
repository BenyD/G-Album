import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"

// Sample albums data
const albums = [
  {
    id: "wedding-collection",
    title: "Wedding Collection",
    description:
      "Our wedding albums capture the magic and emotion of your special day with elegant designs and premium materials. Each page is carefully crafted to tell the story of your celebration.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=wedding album cover panorama",
    images: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=wedding album photo ${i + 1}`,
      alt: `Wedding album photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1, // Some images are wider
      height: i % 5 === 0 ? 2 : 1, // Some images are taller
    })),
    prev: "corporate-events",
    next: "family-portraits",
  },
  {
    id: "family-portraits",
    title: "Family Portraits",
    description:
      "Preserve your family memories with our premium portrait albums. Designed to showcase the special bond between family members with timeless elegance.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=family portrait album cover panorama",
    images: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=family portrait photo ${i + 1}`,
      alt: `Family portrait photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1,
      height: i % 5 === 0 ? 2 : 1,
    })),
    prev: "wedding-collection",
    next: "anniversary-special",
  },
  {
    id: "anniversary-special",
    title: "Anniversary Special",
    description:
      "Celebrate years of love and commitment with our anniversary albums. Each design is created to highlight the journey you've shared together.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=anniversary album cover panorama",
    images: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=anniversary photo ${i + 1}`,
      alt: `Anniversary photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1,
      height: i % 5 === 0 ? 2 : 1,
    })),
    prev: "family-portraits",
    next: "baby-photoshoots",
  },
  {
    id: "baby-photoshoots",
    title: "Baby Photoshoots",
    description:
      "Capture those precious early moments with our specially designed baby albums. Gentle colors and durable materials make these perfect keepsakes.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=baby album cover panorama",
    images: Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=baby photo ${i + 1}`,
      alt: `Baby photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1,
      height: i % 5 === 0 ? 2 : 1,
    })),
    prev: "anniversary-special",
    next: "birthday-celebrations",
  },
  {
    id: "birthday-celebrations",
    title: "Birthday Celebrations",
    description:
      "Make birthday memories last forever with our vibrant and fun birthday albums. Perfect for capturing the joy and excitement of these special milestones.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=birthday album cover panorama",
    images: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=birthday celebration photo ${i + 1}`,
      alt: `Birthday celebration photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1,
      height: i % 5 === 0 ? 2 : 1,
    })),
    prev: "baby-photoshoots",
    next: "travel-memories",
  },
  {
    id: "travel-memories",
    title: "Travel Memories",
    description:
      "Document your adventures with our travel albums. Designed to showcase landscapes, landmarks, and special moments from your journeys around the world.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=travel album cover panorama",
    images: Array.from({ length: 11 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=travel photo ${i + 1}`,
      alt: `Travel photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1,
      height: i % 5 === 0 ? 2 : 1,
    })),
    prev: "birthday-celebrations",
    next: "graduation-albums",
  },
  {
    id: "graduation-albums",
    title: "Graduation Albums",
    description:
      "Commemorate academic achievements with our graduation albums. Designed to celebrate this important milestone with style and sophistication.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=graduation album cover panorama",
    images: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=graduation photo ${i + 1}`,
      alt: `Graduation photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1,
      height: i % 5 === 0 ? 2 : 1,
    })),
    prev: "travel-memories",
    next: "corporate-events",
  },
  {
    id: "corporate-events",
    title: "Corporate Events",
    description:
      "Professional albums for business events, conferences, and corporate milestones. Sleek designs that reflect your company's brand and professionalism.",
    coverImage: "/placeholder.svg?height=600&width=1200&query=corporate event album cover panorama",
    images: Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      src: `/placeholder.svg?height=800&width=600&query=corporate event photo ${i + 1}`,
      alt: `Corporate event photo ${i + 1}`,
      width: i % 3 === 0 ? 2 : 1,
      height: i % 5 === 0 ? 2 : 1,
    })),
    prev: "graduation-albums",
    next: "wedding-collection",
  },
]

export default function AlbumPage({ params }: { params: { albumId: string } }) {
  const album = albums.find((a) => a.id === params.albumId) || albums[0]

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={album.coverImage || "/placeholder.svg"}
            alt={album.title}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-800/70 to-red-700/60"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{album.title}</h1>
            <p className="text-xl text-red-100 max-w-2xl">{album.description}</p>
          </div>
        </div>
      </section>

      {/* Album Gallery - Masonry Layout */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {album.images.map((image) => (
              <div
                key={image.id}
                className={`relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow ${
                  image.width === 2 ? "md:col-span-2" : ""
                } ${image.height === 2 ? "row-span-2" : ""}`}
                style={{
                  gridRow: image.height === 2 ? "span 2" : "auto",
                }}
              >
                <div className={`relative ${image.height === 2 ? "aspect-[3/4]" : "aspect-square"}`}>
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {/* Glassmorphism hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 w-full backdrop-blur-sm bg-white/10">
                      <p className="text-white text-sm">{image.alt}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Buttons */}
      <section className="py-8 bg-gradient-to-t from-red-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Button asChild variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
              <Link href={`/albums/${album.prev}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Album
              </Link>
            </Button>

            <Button asChild variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
              <Link href="/gallery">
                <ExternalLink className="mr-2 h-4 w-4" />
                View More
              </Link>
            </Button>

            <Button asChild variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
              <Link href={`/albums/${album.next}`}>
                Next Album
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
