import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Menu, X } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b">
        <div>
          <h1 className="text-xl md:text-2xl font-medium text-[#22242a] mb-1">
            Hello Timothy! 👋
          </h1>
          <p className="text-sm md:text-base text-[#444955] max-w-md md:max-w-lg">
            Showcase powerful stories, connect with producers, and get your
            scripts seen, valued, and sold.
          </p>
        </div>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[#22242a]"
        >
          <Menu className="h-5 w-5" />
          <span className="hidden sm:inline">Categories</span>
        </Button>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Premium Banner */}
        <div className="relative bg-[#f5f1eb] rounded-lg p-6 md:p-8 mb-8 overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 h-8 w-8 p-0 text-[#444955] hover:bg-white/50"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            <div className="flex-1 max-w-md lg:max-w-lg">
              <h2 className="text-xl md:text-2xl font-semibold text-[#22242a] mb-4">
                Want More Producers to Discover Your Work?
              </h2>
              <p className="text-[#444955] text-sm md:text-base leading-relaxed mb-6">
                With Bara Premium, your work gets priority placement in producer
                searches, increased visibility by genre, and access to valuable
                insights like script views and engagement.
              </p>
              <Button className="bg-[#8b1538] hover:bg-[#7a1230] text-white px-6 py-2">
                Get Bara Premium
              </Button>
            </div>

            <div className="flex-shrink-0 w-full lg:w-auto">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%20422-d8cZHAsTCNdF8Vj7R7SOGBRsA1xwLb.png"
                alt="Group of diverse writers and producers collaborating"
                className="w-full lg:w-80 xl:w-96 h-auto rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Scripts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src="/colorful-tropical-plants-with-vibrant-leaves.png"
                  alt="Broken Promise"
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-[#344054] text-white text-xs px-2 py-1">
                  Adventure
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-600"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-[#22242a] mb-2 text-lg">
                  Broken Promise
                </h3>
                <p className="text-[#444955] text-sm leading-relaxed mb-4 line-clamp-3">
                  A desperate journalist uncovers a hidden AI network
                  controlling world events and must race against time to expose
                  the truth before becoming its next target.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#22242a]">
                    ₦300,000.00
                  </span>
                </div>
                <Button className="w-full mt-3 bg-[#8b1538] hover:bg-[#7a1230] text-white">
                  See more
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
