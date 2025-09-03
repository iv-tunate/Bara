import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Plus, Copy, Calendar } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardNavbar />
      <div className="relative h-48 bg-gradient-to-r from-[#6b5b4d] to-[#8b7355] overflow-hidden">
        <div className="absolute top-4 left-6">
          <h1 className="text-white text-xl font-medium">My profile</h1>
        </div>
        <div className="absolute top-12 right-8">
          <img
            src="/colorful-pens-and-markers-in-a-cup.png"
            alt="Colorful pens"
            className="h-32 w-auto"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-LkyRDd7Bl7c2keeTYagJhSwWtlq8KT.png"
                  alt="Timothy Edwards"
                />
                <AvatarFallback>TE</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold text-[#22242a]">
                    Timothy Edwards
                  </h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4 text-[#858990]" />
                  </Button>
                </div>
                <p className="text-[#444955] text-sm leading-relaxed mb-3 max-w-md">
                  Award-winning writer and motivational speaker. Award-nominated
                  screenwriter focused on supernatural thrillers rooted in
                  Yoruba folklore.
                </p>
                <div className="flex items-center gap-1 text-[#858990] text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-[#ffedee] text-[#810306] border-[#c08183]"
            >
              ⭐ 3 scripts sold
            </Badge>
          </div>

          {/* Portfolio */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-[#22242a] mb-2">
              Portfolio
            </h3>
            <div className="flex items-center gap-2">
              <a href="#" className="text-[#000aaf] text-sm hover:underline">
                Timothy-edwards.com/works
              </a>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3 text-[#858990]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#22242a]">Experience</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4 text-[#858990]" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4 text-[#858990]" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-[#22242a]">
                    Open house studio • Finished man
                  </h4>
                  <p className="text-[#444955] text-sm">
                    Screenwriter/Dialogue coach
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#858990] text-sm mt-1">
                <Calendar className="h-3 w-3" />
                <span>July 2023 – present • 2 years 1 month</span>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-[#22242a]">
                    Telegate Vision • Man Down
                  </h4>
                  <p className="text-[#444955] text-sm">
                    Screenwriter/Assistant director
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#858990] text-sm mt-1">
                <Calendar className="h-3 w-3" />
                <span>July 2022 – January 2023 • 7 months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Works Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-[#22242a] mb-4">Works</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* The Waiter's Dream */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src="/colorful-tropical-plants-with-vibrant-leaves.png"
                  alt="The Waiter's Dream"
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-2 left-2 bg-[#c08183] text-white text-xs">
                  Romance
                </Badge>
              </div>
              <CardContent className="p-4">
                <h4 className="font-medium text-[#22242a] mb-2">
                  The Waiter's Dream
                </h4>
                <p className="text-[#444955] text-sm leading-relaxed">
                  A struggling waiter in Lagos risks everything to chase his
                  secret ambition of becoming a playwright, but when a
                  mysterious guest offers him a chance at success, he must
                  choose between loyalty, love, and the cost...
                </p>
              </CardContent>
            </Card>

            {/* Broken Promise Cards */}
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative">
                  <img
                    src="/colorful-tropical-plants-with-vibrant-leaves.png"
                    alt="Broken Promise"
                    className="w-full h-40 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-[#344054] text-white text-xs">
                    Adventure
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium text-[#22242a] mb-2">
                    Broken Promise
                  </h4>
                  <p className="text-[#444955] text-sm leading-relaxed">
                    A desperate journalist uncovers a hidden AI network
                    controlling world events and must race against time to
                    expose the truth before becoming its next target.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
