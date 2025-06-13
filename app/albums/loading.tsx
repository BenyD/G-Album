import PageHero from "@/components/page-hero";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Photo Albums"
        subtitle="Explore our curated collection of premium photo albums"
        className="py-24 bg-gradient-to-b from-red-50 to-white"
      />

      <section className="py-6 sticky top-16 z-10 border-b border-red-100/50 backdrop-blur-lg bg-white/80">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="w-[140px] h-10 bg-gray-100 rounded-md animate-pulse" />
              <div className="w-[140px] h-10 bg-gray-100 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-white to-red-50/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
