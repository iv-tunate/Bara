"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import Image from "next/image";
import LocationForm from "@/components/LocationForm";
import IdentityVerificationForm from "@/components/IdentityVerificationForm";
import AddExperienceModal from "@/components/AddExperienceModal";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type TabType = "personal" | "location" | "identity";
type Experience = {
  org: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
};

export default function WriterProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      org: "",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      ongoing: false,
    },
  ]);
  const [showModal, setShowModal] = useState(false);

  const handleAddExperience = (exp: Experience) => {
    setExperiences((prev) => [...prev, exp]);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    portfolioLink: "",
    bio: "",
    phone: "",
    dateOfBirth: "",
    gender: "", 
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    verificationNumber: "",
    file: null as File | null,
  });

  const isPersonalInfoComplete = Boolean(
    formData.firstName &&
      formData.lastName &&
      formData.phone &&
      formData.dateOfBirth &&
      formData.gender
  );

  const isLocationInfoComplete = Boolean(
    locationForm.country &&
      locationForm.state &&
      locationForm.city &&
      locationForm.houseNumber &&
      locationForm.street
  );

  const isIdentityInfoComplete = Boolean(
    identityForm.documentType &&
      identityForm.file &&
      identityForm.verificationNumber
  );

  const isCurrentStepComplete =
    (activeTab === "personal" && isPersonalInfoComplete) ||
    (activeTab === "location" && isLocationInfoComplete) ||
    (activeTab === "identity" && isIdentityInfoComplete);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (activeTab === "personal" && isPersonalInfoComplete) {
      setActiveTab("location");
      return;
    } else if (activeTab === "location" && isLocationInfoComplete) {
      setActiveTab("identity");
      return;
    } else if (activeTab === "identity") {
      if (!isIdentityInfoComplete) {
        toast.error(
          "Please complete identity verification (type, number and upload)."
        );
        return;
      }

      try {
        const writerPayload = {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          MiddleName: formData.middleName ?? "",
          PhoneNumber: formData.phone,
          Gender: formData.gender,
          Bio: formData.bio ?? "",
          DateOfBirth: formData.dateOfBirth, 
          IsPremiumMember: false,
          Experiences: experiences.map((exp) => ({
            Description: exp.description,
            Organization: exp.org,
            Project: exp.title,
            StartDate: exp.startDate || null,
            EndDate: exp.ongoing ? null : exp.endDate || null,
            IsCurrent: exp.ongoing,
          })),
          AddressDetail: {
            Country: locationForm.country,
            State: locationForm.state,
            City: locationForm.city,
            Street: locationForm.street,
            PostalCode: locationForm.zipCode ?? "",
            AdditionalDetails: locationForm.houseNumber ?? "",
          },
          VerificationDocument: {
            Type: identityForm.documentType,
            VerificationNumber: identityForm.verificationNumber,
          },
        };

        const form = new FormData();
        form.append("FirstName", writerPayload.FirstName);
        form.append("LastName", writerPayload.LastName);
        form.append("MiddleName", writerPayload.MiddleName);
        form.append("PhoneNumber", writerPayload.PhoneNumber);
        form.append("Gender", writerPayload.Gender);
        form.append("Bio", writerPayload.Bio);
        form.append("DateOfBirth", writerPayload.DateOfBirth);
        form.append("IsPremiumMember", String(writerPayload.IsPremiumMember));
        form.append("Experiences", JSON.stringify(writerPayload.Experiences));
        form.append(
          "AddressDetail",
          JSON.stringify(writerPayload.AddressDetail)
        );
        form.append(
          "VerificationDocument",
          JSON.stringify(writerPayload.VerificationDocument)
        );

        form.append(
          "verificationFile",
          identityForm.file!,
          identityForm.file!.name
        );

        const userId = localStorage.getItem("userId");
        const res = await api.createWriter(form, userId as string);
        if (!res.ok) {
          toast.error(res.message || "Failed to create writer profile");
          return;
        }

        toast.success("Writer profile created!");
        router.push("/writer/dashboard");
      } catch (err: any) {
        console.error(err);
        toast.error("An unexpected error occurred. Check console.");
      }
    }
  };

  const handleSkip = () => {
    if (activeTab === "personal") setActiveTab("location");
    else if (activeTab === "location") setActiveTab("identity");
    else if (activeTab === "identity") {
      router.push("/writer/dashboard");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a0000] bg-opacity-80 flex items-center justify-center z-50 p-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-3 md:p-10 w-full max-w-3xl max-h-screen overflow-y-auto flex flex-col space-y-1 "
      >
        <div className="">
          <Logo />
        </div>

        <div className="flex flex-col space-y-1 p-3">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-[#22242A] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="border border-[#ABADB2] p-2 rounded-md w-full"
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
                    className="border border-[#ABADB2] p-2 rounded-md w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-[#22242A] mb-1">
                    Middle Name (optional)
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="border border-[#ABADB2] p-2 rounded-md w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-[#22242A] mb-1">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="border border-[#ABADB2] p-2 rounded-md w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-[#22242A] mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="border border-[#ABADB2] p-2 rounded-md w-full"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col mt-4">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="border border-[#ABADB2] p-1 rounded-md w-full "
                />
              </div>

              {/* Add Experience */}
              <div className="flex justify-end items-center gap-1 cursor-pointer text-[#810306] font-semibold mb-4 text-sm">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1"
                >
                  <Image
                    src="/plus-icon.png"
                    alt="Add experience"
                    width={20}
                    height={20}
                  />
                  <span>Add Experience</span>
                </button>
              </div>

              {showModal && (
                <AddExperienceModal
                  onClose={() => setShowModal(false)}
                  onSave={handleAddExperience}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-[#22242A] mb-1">
                    Phone Number
                  </label>
                  <div className="border border-[#ABADB2] rounded-md px-2 py-1 w-full">
                    <PhoneInput
                      country={"ng"}
                      value={formData.phone}
                      onChange={(phone) => setFormData({ ...formData, phone })}
                      inputClass="!bg-transparent !border-none !text-sm !w-full"
                      containerClass="!w-full"
                      buttonClass="!border-none"
                      enableSearch={true}
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
          <div className="flex justify-end gap-4 pt-4 mt-auto">
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
        </div>
      </form>
    </div>
  );
}
