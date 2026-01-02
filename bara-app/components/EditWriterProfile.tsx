"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Writer } from "@/models/user";
import { api } from "@/utils/api";
import { getCountries, getStates, getCities } from "@/utils/geoservices";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from "react-hot-toast";
import { getUserId } from "@/utils/tokenManager";
import AddExperienceModal from "./AddExperienceModal";

interface EditWriterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Writer) => void;
  initialData: Writer;
}

type Experience = {
  org: string;
  title: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  ongoing: boolean;
  description: string;
};

export default function EditWriterProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditWriterProfileModalProps) {
  const [formData, setFormData] = useState<Writer>(initialData);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);

      if (initialData.experiences) {
        const mappedExp = initialData.experiences.map((exp: any) => {
          const startDate = new Date(exp.startDate);
          const endDate = exp.endDate ? new Date(exp.endDate) : null;

          return {
            org: exp.organization || "",
            title: exp.project || "",
            startMonth: String(startDate.getMonth() + 1).padStart(2, "0"),
            startYear: String(startDate.getFullYear()),
            endMonth: endDate
              ? String(endDate.getMonth() + 1).padStart(2, "0")
              : "",
            endYear: endDate ? String(endDate.getFullYear()) : "",
            ongoing: exp.isCurrent || false,
            description: exp.description || "",
          };
        });
        setExperiences(mappedExp);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (e) {
        console.error("Failed to fetch countries", e);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (!formData.address?.country) return;
    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getStates(formData.address.country);
        setStates(data);
        if (!data.includes(formData.address.state)) {
          setFormData((prev) => ({
            ...prev,
            address: { ...prev.address, state: "", city: "" },
          }));
        }
      } catch (e) {
        console.error("Failed to fetch states", e);
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, [formData.address?.country]);

  useEffect(() => {
    if (!formData.address?.state || !formData.address?.country) return;
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const data = await getCities(
          formData.address.country,
          formData.address.state
        );
        setCities(data);
        if (!data.includes(formData.address.city)) {
          setFormData((prev) => ({
            ...prev,
            address: { ...prev.address, city: "" },
          }));
        }
      } catch (e) {
        console.error("Failed to fetch cities", e);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [formData.address?.state]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name in (formData.address || {})) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCountrySelect = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, country, state: "", city: "" },
    }));
    setCountryOpen(false);
  };

  const handleStateSelect = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, state, city: "" },
    }));
    setStateOpen(false);
  };

  const handleCitySelect = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, city },
    }));
    setCityOpen(false);
  };

  const handleAddExperiences = (newExperiences: Experience[]) => {
    setExperiences(newExperiences);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const writerId = getUserId();

      if (!writerId) {
        toast.error("User ID not found");
        return;
      }

      const form = new FormData();

      form.append("FirstName", formData.firstName || "");
      form.append("LastName", formData.lastName || "");
      form.append("MiddleName", formData.middleName || "");
      form.append("PhoneNumber", formData.phoneNumber || "");
      form.append("Gender", formData.gender || "");
      form.append("Bio", formData.bio || "");
      form.append("DateOfBirth", formData.dateOfBirth || "");
      form.append("IsPremiumMember", "false");
      form.append("AddressDetail.Street", formData.address?.street || "");
      form.append("AddressDetail.City", formData.address?.city || "");
      form.append("AddressDetail.State", formData.address?.state || "");
      form.append(
        "AddressDetail.Country",
        formData.address?.country || "Nigeria"
      );
      form.append(
        "AddressDetail.PostalCode",
        formData.address?.postalCode || ""
      );
      form.append("PortfolioUrl", formData.portfolioUrl || "");
      form.append(
        "AddressDetail.AdditionalDetails",
        formData.address?.additionalDetails || ""
      );

      if (formData.profileImageUrl) {
        form.append("ProfileImageUrl", formData.profileImageUrl);
      }
      if (formData.profileImagePublicId) {
        form.append("ProfileImagePublicId", formData.profileImagePublicId);
      }

      const validExperiences = experiences.filter(
        (exp) => exp.org?.trim() && exp.title?.trim() && exp.description?.trim()
      );

      if (validExperiences.length > 0) {
        validExperiences.forEach((exp, index) => {
          form.append(`Experiences[${index}].Description`, exp.description);
          form.append(`Experiences[${index}].Organization`, exp.org);
          form.append(`Experiences[${index}].Project`, exp.title);
          form.append(`Experiences[${index}].IsCurrent`, String(exp.ongoing));

          if (exp.startYear && exp.startMonth) {
            form.append(
              `Experiences[${index}].StartDate`,
              `${exp.startYear}-${exp.startMonth}-01`
            );
          }

          if (!exp.ongoing && exp.endYear && exp.endMonth) {
            form.append(
              `Experiences[${index}].EndDate`,
              `${exp.endYear}-${exp.endMonth}-01`
            );
          }
        });
      }

      form.append("VerificationDocument.Type", "NationalID");
      form.append("VerificationDocument.VerificationNumber", "N/A");

      const response = await api.updateWriterProfile(writerId, form);

      if (response.data?.isSuccess) {
        toast.success("Profile updated successfully!");
        onSave?.(response.data.data);
        onClose();

        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(response.data?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating writer profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative">
        {/* Header */}
        <button
          type="button"
          className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#22242A] mb-4 font-bold cursor-pointer hover:text-[#800000] transition-colors"
          onClick={onClose}
        >
          <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
          <span>Back</span>
        </button>

        <h2 className="text-2xl font-semibold text-[#333740] mb-6">
          Edit Profile
        </h2>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              First Name
            </label>
            <input
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Middle Name
            </label>
            <input
              name="middleName"
              value={formData.middleName || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
              placeholder="Middle Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Last Name
            </label>
            <input
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
              placeholder="Last Name"
            />
          </div>
        </div>
        <div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Portfolio URL
            </label>
            <input
              name="portfolioUrl"
              value={formData.portfolioUrl || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Phone + Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Phone Number
            </label>
            <div className="border border-[#ABADB2] rounded px-2 py-1">
              <PhoneInput
                country={"ng"}
                value={formData.phoneNumber || ""}
                onChange={(phone) =>
                  setFormData({ ...formData, phoneNumber: `+${phone}` })
                }
                inputClass="!bg-transparent !border-none !text-sm !w-full"
                containerClass="!w-full"
                buttonClass="!border-none"
                enableSearch={true}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-[#22242A]">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            onChange={handleChange}
            readOnly
            disabled
            className="border border-[#ABADB2] bg-gray-100 rounded px-3 py-2 w-full text-sm focus:outline-none cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Date of birth cannot be changed as it is used for identity
            verification.
          </p>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-[#22242A]">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Experiences */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-[#22242A]">
              Experiences
            </label>
            <button
              type="button"
              onClick={() => setShowExperienceModal(true)}
              className="flex items-center gap-1 text-[#810306] font-semibold text-sm hover:text-[#a22] transition-colors"
            >
              <Image src="/plus-icon.png" alt="Add" width={18} height={18} />
              <span>{experiences.length > 0 ? "Edit" : "Add"} Experiences</span>
            </button>
          </div>
          {experiences.length > 0 && (
            <div className="text-xs text-gray-600">
              {experiences.length} experience(s) added
            </div>
          )}
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Country
            </label>
            <button
              type="button"
              onClick={() => setCountryOpen((p) => !p)}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm flex justify-between items-center focus:outline-none focus:border-[#810306]"
            >
              {formData.address?.country || "Select country"}
              <Image
                src="/dropdown.png"
                alt="Dropdown"
                width={20}
                height={20}
              />
            </button>
            {countryOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#ABADB2] rounded shadow w-full z-10 max-h-48 overflow-y-auto">
                {loadingCountries ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    Loading...
                  </div>
                ) : (
                  countries.map((c) => (
                    <div
                      key={c}
                      onClick={() => handleCountrySelect(c)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {c}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              State/Province
            </label>
            <button
              type="button"
              onClick={() => setStateOpen((p) => !p)}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm flex justify-between items-center focus:outline-none focus:border-[#810306]"
            >
              {formData.address?.state || "Select state"}
              <Image
                src="/dropdown.png"
                alt="Dropdown"
                width={20}
                height={20}
              />
            </button>
            {stateOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow w-full z-10 max-h-48 overflow-y-auto">
                {loadingStates ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    Loading...
                  </div>
                ) : (
                  states.map((s) => (
                    <div
                      key={s}
                      onClick={() => handleStateSelect(s)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {s}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              City
            </label>
            <button
              type="button"
              onClick={() => setCityOpen((p) => !p)}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm flex justify-between items-center focus:outline-none focus:border-[#810306]"
            >
              {formData.address?.city || "Select city"}
              <Image
                src="/dropdown.png"
                alt="Dropdown"
                width={20}
                height={20}
              />
            </button>
            {cityOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow w-full z-10 max-h-48 overflow-y-auto">
                {loadingCities ? (
                  <div className="px-3 py-2 text-sm text-gray-400">
                    Loading...
                  </div>
                ) : (
                  cities.map((c) => (
                    <div
                      key={c}
                      onClick={() => handleCitySelect(c)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {c}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Street
            </label>
            <input
              name="street"
              value={formData.address?.street || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Zip Code
            </label>
            <input
              name="postalCode"
              value={formData.address?.postalCode || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="border border-[#810306] text-[#810306] px-10 py-2 rounded-md text-sm cursor-pointer hover:bg-red-50 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-[#810306] text-white px-8 py-2 rounded-md text-sm cursor-pointer disabled:opacity-70 hover:bg-[#660000] transition-colors flex items-center gap-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        {/* Experience Modal */}
        {showExperienceModal && (
          <AddExperienceModal
            initial={experiences}
            onClose={() => setShowExperienceModal(false)}
            onSave={handleAddExperiences}
          />
        )}
      </div>
    </div>
  );
}
