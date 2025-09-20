"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "Timothy",
    lastName: "Edwards",
    email: "timothyedwards@gmail.com",
    phone: "901 2345 678",
    nin: "",
    country: "Nigeria",
    state: "Lagos",
    city: "Lekki",
    houseNumber: "234",
    street: "Bode Peters",
    zip: "1000231",
    proofOfIdentity: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);

      setTimeout(() => {
        router.back();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="relative max-w-4xl mx-auto px-6 py-10">
      {/* Toast notification */}
      {isSaved && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-md shadow-md animate-fade-in-out">
          Changes saved successfully!
        </div>
      )}

      <h1 className="text-xl font-semibold text-[#22242A] mb-8">My Account</h1>

      <div className="space-y-10">
        {/* Profile Picture */}
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-3">
            <Image
              src="/default-avatar.png"
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
            <div>
              <span className="font-semibold text-lg text-[#22242A]">
                Profile Picture
              </span>

              <div className="flex items-center gap-2 mt-2">
                <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#810306] text-white rounded cursor-pointer">
                  Change image
                  <Image
                    src="/upload.png"
                    alt="Upload"
                    width={12}
                    height={12}
                  />
                  <input type="file" className="hidden" />
                </label>

                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-1 text-sm text-[#810306] border border-[#810306] rounded cursor-pointer font-semibold"
                >
                  Remove
                </button>
              </div>
              <p className="text-xs text-[#858990] mt-2">
                Upload image in PNG and JPEG formats under 15mb
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-xs text-[#810306] font-bold mt-15 cursor-pointer"
          >
            Edit Details
            <Image src="/red edit.png" alt="Edit" width={10} height={10} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-8">
          {/* Personal Info */}
          <div>
            <h2 className="text-lg font-medium text-[#22242A] mb-3">
              Personal information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col">
              <label className="text-sm font-semibold text-[#22242A] mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-[#ABADB2] p-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Phone Number
                </label>
                <div className="flex items-center border border-[#ABADB2] rounded-md px-2 focus-within:ring-2 focus-within:ring-[#810306]">
                  <div className="flex items-center mr-2 border border-[#ABADB2] px-1 py-1 rounded-md">
                    <Image
                      src="/Nigerian flag.png"
                      alt="Nigeria flag"
                      width={20}
                      height={14}
                      className="mr-2"
                    />
                    <span className="text-sm mr-2">+234</span>
                    <Image
                      src="/dropdown.png"
                      alt="Dropdown"
                      width={20}
                      height={12}
                    />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 outline-none bg-transparent text-sm p-2"
                  />
                </div>
              </div>

              {/* NIN */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  NIN
                </label>
                <input
                  type="text"
                  name="nin"
                  value={formData.nin}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-medium text-[#22242A] mb-3">
              Location details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Country */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Image
                      src="/Nigerian flag.png"
                      alt="Nigeria flag"
                      width={20}
                      height={14}
                    />
                  </div>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full border border-[#ABADB2] rounded-md pl-10 pr-8 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#810306]"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                  </select>
                  <Image
                    src="/dropdown.png"
                    alt="Dropdown"
                    width={20}
                    height={12}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>

              {/* State */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  State/province
                </label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>

              {/* City */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  City
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  House Number
                </label>
                <input
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Street
                </label>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Zip Code
                </label>
                <input
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#810306]"
                />
              </div>
            </div>
          </div>

          {/* Identity Verification */}
          <div>
            <h2 className="text-sm font-medium text-[#333740] mb-3">
              Identity verification
            </h2>
            <div className="relative mb-4">
              <label className="block text-sm font-semibold text-[#22242A] mb-1">
                Proof of Identity
              </label>
              <div className="relative">
                <select
                  name="proofOfIdentity"
                  value={formData.proofOfIdentity}
                  onChange={handleChange}
                  className="w-full border border-[#ABADB2] rounded-md px-3 pr-10 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#810306]"
                >
                  <option value="">Select proof</option>
                  <option value="Driver’s license">Driver’s license</option>
                  <option value="Passport">International Passport</option>
                  <option value="NIN Slip">NIN Slip</option>
                </select>
                <Image
                  src="/dropdown.png"
                  alt="Dropdown"
                  width={20}
                  height={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22242A] mb-1">
                Upload selected proof of identity
              </label>
              <div
                onClick={() =>
                  document.getElementById("identityUpload")?.click()
                }
                className="w-full h-40 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
              >
                <p className="text-sm text-[#333740]">
                  Drag and drop file (png, jpeg) here
                </p>
                <p className="text-sm text-[#333740] mt-1">
                  or{" "}
                  <span className="text-[#810306] font-semibold underline">
                    Browse
                  </span>
                </p>
              </div>
              <input
                id="identityUpload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 ">
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-[#810306] text-[#810306] px-10 py-2 rounded-md text-sm cursor-pointer hover:bg-[#fbeaea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 rounded-md text-sm cursor-pointer ${
                isSaving
                  ? "bg-[#F5F5F5] text-white"
                  : "bg-[#810306] text-white hover:bg-[#6a0505]"
              }`}
            >
              {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
