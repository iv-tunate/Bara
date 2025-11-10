"use client";

import { useEffect, useState, useRef } from "react";
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
import { uploadImage } from "@/utils/upload";
import { ProcessingModal, ProcessingStatus } from "@/components/ResponseModal";
import LoadingButton from "@/components/LoadingButton";

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
  const [showModal, setShowModal] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImagePublicId, setProfileImagePublicId] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
   null
 );
 const [uploading, setUploading] = useState(false);

const [loading, setLoading] = useState(false);

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
  const [locationForm, setLocationForm] = useState({
    country: "Nigeria",
    state: "",
    city: "",
    additionalDetails: "",
    street: "",
    zipCode: "",
  });

  const [identityForm, setIdentityForm] = useState({
    documentType: "",
    verificationNumber: "",
    file: null as File | null,
  });
   useEffect(() => {
     window.scrollTo({ top: 0, behavior: "smooth" });
   }, [activeTab]);

  const handleAddExperience = (exp: Experience) => {
    setExperiences((prev) => [...prev, exp]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const fileInputRef = useRef<HTMLInputElement | null>(null);

const handleProfileImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setProfileImage(file);
  setProfileImagePreview(URL.createObjectURL(file));

  setUploading(true);
  try {
    const user = {
      firstName: formData.firstName || "Temp",
      lastName: formData.lastName || "User",
      id: localStorage.getItem("userId") || "temp",
    };

    const uploadResult = await uploadImage(file, "Writer", user);

    setProfileImageUrl(uploadResult.url);
    setProfileImagePublicId(uploadResult.publicId || "");

    toast.success("Profile image uploaded successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to upload profile image");
  } finally {
    setUploading(false);
  }
};

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
      locationForm.zipCode &&
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
         "Please complete identity verification (type, number, and upload)."
       );
       return;
     }

     setLoading(true); 

     try {
       const form = new FormData();

       form.append("FirstName", formData.firstName);
       form.append("LastName", formData.lastName);
       form.append("MiddleName", formData.middleName || "none");
       form.append("PhoneNumber", formData.phone);
       form.append("Gender", formData.gender);
       form.append("Bio", formData.bio || "");
       form.append("DateOfBirth", formData.dateOfBirth);
       form.append("IsPremiumMember", "false");
       form.append("AddressDetail.Street", locationForm.street || "");
       form.append("AddressDetail.City", locationForm.city || "");
       form.append("AddressDetail.State", locationForm.state || "");
       form.append("AddressDetail.Country", locationForm.country || "Nigeria");
       form.append("AddressDetail.PostalCode", locationForm.zipCode || "");
       form.append("PortfolioUrl", formData.portfolioLink || "");
       form.append(
         "AddressDetail.AdditionalDetails",
         locationForm.additionalDetails || "no additional details"
       );
       form.append("VerificationDocument.Type", identityForm.documentType);
       form.append(
         "VerificationDocument.VerificationNumber",
         identityForm.verificationNumber
       );
       form.append(
         "VerificationDocument.Document",
         identityForm.file!,
         identityForm.file!.name
       );

       if (profileImageUrl) {
         form.append("ProfileImageUrl", profileImageUrl);
         form.append("ProfileImagePublicId", profileImagePublicId);
       }

       const validExperiences = experiences.filter(
         (exp) =>
           exp.org?.trim() && exp.title?.trim() && exp.description?.trim()
       );

       if (validExperiences.length > 0) {
         validExperiences.forEach((exp, index) => {
           form.append(`Experiences[${index}].Description`, exp.description);
           form.append(`Experiences[${index}].Organization`, exp.org);
           form.append(`Experiences[${index}].Project`, exp.title);
           form.append(`Experiences[${index}].IsCurrent`, String(exp.ongoing));

           if (exp.startDate)
             form.append(`Experiences[${index}].StartDate`, exp.startDate);

           if (!exp.ongoing && exp.endDate)
             form.append(`Experiences[${index}].EndDate`, exp.endDate);
         });
       }

       const userId = localStorage.getItem("userId");
       const res = await api.createWriter(form, userId as string);

       if (res.data.isSucess && res.data.statusCode === 201) {
         toast.success("Writer profile created!");
         setTimeout(() => {
           router.push(`/writer/profile/${userId}`);
         }, 1500);
       } else if (res.data.statusCode === 409) {
         toast.error(res.data.message);
         setTimeout(() => {
           router.push(`/writer/profile/${userId}`);
         }, 1500);
       } else {
         toast.error(res.data.message || "Failed to create writer profile");
       }
     } catch (err) {
       console.error(err);
       toast.error("An unexpected error occurred. Check console.");
     } finally {
       setLoading(false); 
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
              <div>
                <label className="block mb-1 text-sm font-semibold text-[#22242A]">
                  Upload your profile picture
                </label>

                {profileImage ? (
                  <div className="border-2 border-dashed border-[#ABADB2] rounded-md p-4 bg-[#F5F5F5]">
                    <div className="flex flex-col items-center space-y-3">
                      <Image
                        src="/checkring.png"
                        alt="Upload complete"
                        width={32}
                        height={32}
                      />
                      <span className="text-sm text-[#333740] font-medium">
                        Upload complete
                      </span>

                      <Image
                        src={
                          profileImagePreview ||
                          URL.createObjectURL(profileImage)
                        }
                        alt="Profile preview"
                        width={100}
                        height={100}
                        className="rounded-full border object-cover"
                      />

                      <div className="w-full h-1 bg-green-600 rounded" />
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
                  >
                    <p className="text-sm text-[#333740]">
                      Drag and drop your image here
                    </p>
                    <p className="text-sm text-[#333740] mt-1">
                      or{" "}
                      <span className="text-[#810306] font-semibold underline">
                        Browse
                      </span>
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleProfileImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
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
                      onChange={(phone) =>
                        setFormData({ ...formData, phone: `+${phone}` })
                      }
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
           
              <LoadingButton
                type="button"
                onClick={handleSkip}
                variant="secondary"
                disabled={activeTab === "identity"}
              >
                Skip
              </LoadingButton>

              <LoadingButton
                type="submit"
                loading={loading}
                disabled={!isCurrentStepComplete}
                variant="primary"
              >
                {activeTab === "identity" ? "Complete Profile" : "Continue"}
              </LoadingButton>
           
          </div>
        </div>
      </form>
    </div>
  );
}
