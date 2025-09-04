"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Image from "next/image";
import LocationForm from "@/components/LocationForm";
import IdentityVerificationForm from "@/components/IdentityVerificationForm";

type TabType = "personal" | "location" | "identity";

export default function WriterProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    portfolioLink: "",
    bio: "",
    phone: "",
    nin: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "personal" && isPersonalInfoComplete)
      setActiveTab("location");
    else if (activeTab === "location" && isLocationInfoComplete)
      setActiveTab("identity");
    else if (activeTab === "identity" && isIdentityInfoComplete) {
      console.log("Submitted All Data:", {
        personal: formData,
        location: locationForm,
        identity: identityForm,
      });
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    if (activeTab === "personal") setActiveTab("location");
    else if (activeTab === "location") setActiveTab("identity");
    else router.push("/dashboard");
  };

  const [locationForm, setLocationForm] = useState({
    country: "Nigeria",
    state: "",
    city: "",
    houseNumber: "",
    street: "",
    zipCode: "",
  });

  const [identityForm, setIdentityForm] = useState({
    documentType: "",
    file: null as File | null,
  });

  const isPersonalInfoComplete =
    formData.firstName &&
    formData.lastName &&
    formData.portfolioLink &&
    formData.bio &&
    formData.phone &&
    formData.nin;

  const isLocationInfoComplete =
    locationForm.country &&
    locationForm.state &&
    locationForm.city &&
    locationForm.houseNumber &&
    locationForm.street &&
    locationForm.zipCode;

  const isIdentityInfoComplete = identityForm.documentType && identityForm.file;

  const isCurrentStepComplete =
    (activeTab === "personal" && isPersonalInfoComplete) ||
    (activeTab === "location" && isLocationInfoComplete) ||
    (activeTab === "identity" && isIdentityInfoComplete);

  return (
    <div className="fixed inset-0 bg-[#1a0000] bg-opacity-80 flex items-center justify-center z-50 p-2 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 md:p-10 w-full max-w-3xl space-y-3"
      >
        <Logo />

        <h1 className="text-xl md:text-2xl font-medium text-[#22242A] mb-4">
          Set up your profile
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 text-sm font-medium text-[#858990] space-x-6 mb-6">
          {(["personal", "location", "identity"] as TabType[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="relative px-3 pt-2 pb-3 text-sm"
            >
              <span
                className={`${
                  activeTab === tab ? "text-[#810306]" : "text-[#858990]"
                }`}
              >
                {tab === "personal"
                  ? "Personal information"
                  : tab === "location"
                  ? "Location details"
                  : "Identity verification"}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-full bg-[#810306] rounded-tr-2xl rounded-tl-2xl" />
              )}
            </button>
          ))}
        </div>

        {/* Personal Info */}
        {activeTab === "personal" && (
          <>
            {/* First & Last Name */}
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
                  className="border border-[#ABADB2] p-2 rounded-md"
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
                  className="border border-[#ABADB2] p-2 rounded-md"
                />
              </div>
            </div>

            {/* Portfolio Link */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#22242A] mb-1">
                Portfolio Link
              </label>
              <input
                type="text"
                name="portfolioLink"
                value={formData.portfolioLink}
                onChange={handleChange}
                className="border border-[#ABADB2] p-2 rounded-md w-full"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#22242A] mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="border border-[#ABADB2] p-2 rounded-md w-full resize-none"
              />
            </div>

            {/* Add Experience (Right Aligned) */}
            <div className="flex justify-end items-center gap-2 cursor-pointer text-[#810306] font-semibold mb-4">
              <Image
                src="/plus-icon.png"
                alt="Add experience"
                width={20}
                height={20}
              />
              <span>Add Experience</span>
            </div>

            {/* Phone & NIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Phone Number
                </label>
                <div className="flex items-center border border-[#ABADB2] rounded-md px-2 py-1">
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
                    className="flex-1 outline-none bg-transparent text-sm"
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
                  className="border border-[#ABADB2] py-2 rounded-md"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "location" && (
          <LocationForm form={locationForm} setForm={setLocationForm} />
        )}
        {activeTab === "identity" && (
          <IdentityVerificationForm
            form={identityForm}
            setForm={setIdentityForm}
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleSkip}
            className="px-8 py-2 border-2 border-[#810306] text-[#810306] rounded-md font-semibold"
          >
            Skip
          </button>
          <button
            type="submit"
            disabled={!isCurrentStepComplete}
            className={`px-8 py-2 rounded-md font-semibold ${
              isCurrentStepComplete
                ? "bg-[#810306] text-white"
                : "bg-[#F5F5F5] text-[#858990] cursor-not-allowed"
            }`}
          >
            {activeTab === "identity" ? "Get Started" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
