"use client";

import type React from "react";

import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardNavbar from "@/components/DashboardNavbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AddScriptPage() {
  const [coverImage, setCoverImage] = useState<string>(
    "/restaurant-scene-with-person.jpg"
  );
  const [formData, setFormData] = useState({
    scriptLink:
      "https://drive.google.com/file/d/1AbCdeFgHijkLmNoPqrStUvWxYz123456/view",
    title: "The Waiter's Dream",
    genre: "Romance",
    logline:
      "A struggling waiter in Lagos risks everything to chase his secret ambition of becoming a playwright, but when a mysterious guest offers him a chance at success, he must choose between loyalty, love, and the cost of fame.",
    synopsis:
      "In the bustling heart of Lagos, Kola, a quiet and observant waiter at a popular restaurant, serves tables by day but writes stories by night. Unknown to his colleagues and even his family, Kola harbors a lifelong dream of becoming a renowned playwright — a dream he's kept buried beneath...",
    ownership: "I retain full rights",
    price: "280,000",
  });
  const [agreements, setAgreements] = useState({
    originalWork: true,
    commission: true,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <DashboardNavbar />
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
          <span className="text-gray-600">Continue exploring scripts</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Add script
        </h1>

        <form className="space-y-8">
          {/* Script Link */}
          <div>
            <Label
              htmlFor="script-link"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Add link to script{" "}
              <span className="text-gray-500">
                (Please include a Google drive link of your script)
              </span>
            </Label>
            <Input
              id="script-link"
              value={formData.scriptLink}
              onChange={(e) =>
                setFormData({ ...formData, scriptLink: e.target.value })
              }
              className="w-full"
            />
          </div>

          {/* Title and Genre Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Script title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label
                htmlFor="genre"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Genre
              </Label>
              <Select
                value={formData.genre}
                onValueChange={(value) =>
                  setFormData({ ...formData, genre: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Thriller">Thriller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logline and Synopsis Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="logline"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Logline
              </Label>
              <Textarea
                id="logline"
                value={formData.logline}
                onChange={(e) =>
                  setFormData({ ...formData, logline: e.target.value })
                }
                rows={6}
                className="resize-none"
              />
            </div>
            <div>
              <Label
                htmlFor="synopsis"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Synopsis
              </Label>
              <Textarea
                id="synopsis"
                value={formData.synopsis}
                onChange={(e) =>
                  setFormData({ ...formData, synopsis: e.target.value })
                }
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          {/* Ownership and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="ownership"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                IP ownership terms
              </Label>
              <Select
                value={formData.ownership}
                onValueChange={(value) =>
                  setFormData({ ...formData, ownership: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I retain full rights">
                    I retain full rights
                  </SelectItem>
                  <SelectItem value="Shared ownership">
                    Shared ownership
                  </SelectItem>
                  <SelectItem value="Transfer all rights">
                    Transfer all rights
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="price"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Set price
              </Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium text-gray-700">
                Add cover image
              </Label>
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                Use AI to generate image
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {coverImage ? (
                <div className="space-y-4">
                  <img
                    src={coverImage || "/placeholder.svg"}
                    alt="Cover image"
                    className="mx-auto rounded-lg max-w-sm h-48 object-cover"
                  />
                  <div className="flex justify-center gap-4">
                    <label htmlFor="image-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                      >
                        Change image
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCoverImage("")}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Remove image
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-gray-600">Click to upload cover image</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="original-work"
                checked={agreements.originalWork}
                onCheckedChange={(checked) =>
                  setAgreements({
                    ...agreements,
                    originalWork: checked as boolean,
                  })
                }
                className="mt-1"
              />
              <Label
                htmlFor="original-work"
                className="text-sm text-gray-700 leading-relaxed"
              >
                I agree this script is my original work
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="commission"
                checked={agreements.commission}
                onCheckedChange={(checked) =>
                  setAgreements({
                    ...agreements,
                    commission: checked as boolean,
                  })
                }
                className="mt-1"
              />
              <Label
                htmlFor="commission"
                className="text-sm text-gray-700 leading-relaxed"
              >
                I agree to Bara's 15% commission on successful sales
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-medium"
            >
              Add script
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
