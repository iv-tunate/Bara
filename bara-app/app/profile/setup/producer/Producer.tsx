"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Image from "next/image";
import LocationForm from "@/components/LocationForm";
import IdentityVerificationForm from "@/components/IdentityVerificationForm";
import { api } from "@/utils/api";
import { getUserId } from "@/utils/tokenManager";
import {
  createProducerFormData,
  validateProducerData,
  type ProducerFormData,
} from "@/utils/profileFormData";

type TabType = "personal" | "location" | "identity";

export default function ProducerProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Personal info state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "" as "MALE" | "FEMALE" | "OTHER" | "",
    bio: "",
  });

  // Location state
  const [locationForm, setLocationForm] = useState({
    country: "Nigeria",
    state: "",
    city: "",
    street: "",
    postalCode: "",
    additionalDetails: "",
  });

  // Identity verification state
  const [identityForm, setIdentityForm] = useState({
    documentType: "" as
      | "BVN"
      | "NIN"
      | "DRIVERS_LICENSE"
      | "INTERNATIONAL_PASSPORT"
      | "",
    verificationNumber: "",
    file: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "personal" && isPersonalInfoComplete) {
      setActiveTab("location");
      return;
    }

    if (activeTab === "location" && isLocationInfoComplete) {
      setActiveTab("identity");
      return;
    }

    if (activeTab === "identity" && isIdentityInfoComplete) {
      await submitProducerProfile();
    }
  };

  const submitProducerProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const userId = getUserId();
      if (!userId) {
        setError("User session expired. Please log in again.");
        router.push("/auth/login");
        return;
      }

      const profileData: ProducerFormData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as "MALE" | "FEMALE" | "OTHER",
        bio: formData.bio,
        street: locationForm.street,
        city: locationForm.city,
        state: locationForm.state,
        country: locationForm.country,
        postalCode: locationForm.postalCode,
        additionalDetails: locationForm.additionalDetails,
        documentType: identityForm.documentType as
          | "BVN"
          | "NIN"
          | "DRIVERS_LICENSE"
          | "INTERNATIONAL_PASSPORT",
        verificationNumber: identityForm.verificationNumber,
        documentFile: identityForm.file!,
      };

      const validationErrors = validateProducerData(profileData);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(", "));
        return;
      }

      const formDataToSubmit = createProducerFormData(profileData);
      const response = await api.createProducer(formDataToSubmit, userId);

      if (response.success) {
        router.push("/dashboard-producer");
      } else {
        setError(
          response.message ||
            "Failed to create producer profile. Please try again."
        );
      }
    } catch (error) {
      console.error("Producer profile creation error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (activeTab === "personal") {
      setActiveTab("location");
    } else if (activeTab === "location") {
      setActiveTab("identity");
    } else {
      router.push("/dashboard");
    }
  };

  const isPersonalInfoComplete =
    formData.firstName &&
    formData.lastName &&
    formData.phoneNumber &&
    formData.dateOfBirth &&
    formData.gender;

  const isLocationInfoComplete =
    locationForm.country &&
    locationForm.state &&
    locationForm.city &&
    locationForm.street;

  const isIdentityInfoComplete =
    identityForm.documentType &&
    identityForm.verificationNumber &&
    identityForm.file;

  const isCurrentStepComplete =
    (activeTab === "personal" && isPersonalInfoComplete) ||
    (activeTab === "location" && isLocationInfoComplete) ||
    (activeTab === "identity" && isIdentityInfoComplete);

  return (
    <div className="fixed inset-0 bg-[#1a0000] bg-opacity-80 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-10 w-full max-w-3xl space-y-2"
      >
        <Logo />

        <h1 className="text-xl md:text-2xl font-medium text-[#22242A]">
          Set up your profile
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex border-b border-gray-300 text-sm font-medium text-[#858990] space-x-6">
          {(["personal", "location", "identity"] as TabType[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="relative px-4 pt-2 pb-3 text-sm"
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

        {/* Form Sections */}
        {activeTab === "personal" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-3 rounded-md"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-3 rounded-md"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Company/Studio
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-3 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Phone number
                </label>
                <div className="flex items-center border border-[#ABADB2] rounded-md px-3 py-2">
                  <div className="flex items-center mr-2 border border-[#ABADB2] py-2 px-2 rounded-md">
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
                      alt="Dropdown arrow"
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

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  NIN
                </label>
                <input
                  type="text"
                  name="nin"
                  value={formData.nin}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-3 rounded-md"
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
