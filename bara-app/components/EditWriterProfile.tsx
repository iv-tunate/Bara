"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface EditWriterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initialData: FormData; 
}

export interface FormData {
  name: string;
  portfolio: string;
  bio: string;
  country: string;
  state: string;
  city: string;
  houseNumber: string;
  street: string;
  zip: string;
}

const countryStates: Record<string, string[]> = {
  Ghana: ["Accra", "Kumasi", "Tema"],
  Nigeria: ["Lagos", "Abuja", "Port Harcourt"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu"],
};

export default function EditWriterProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditWriterProfileModalProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [countryOpen, setCountryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);


  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountrySelect = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      country,
      state: countryStates[country][0], 
    }));
    setCountryOpen(false);
  };

  const handleStateSelect = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      state,
    }));
    setStateOpen(false);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-10 relative">
        {/* Back Button */}
        <button
          type="button"
          className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[#22242A] mb-4 font-bold cursor-pointer"
          onClick={onClose}
        >
          <Image
            src="/Arrow_left.png"
            alt="Back"
            width={20}
            height={20}
            className="inline-block"
          />
          <span>Back</span>
        </button>

        <h2 className="text-xl font-semibold text-[#333740] mb-4">
          Edit profile
        </h2>

        {/* Name + Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Portfolio
            </label>
            <input
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-[#22242A]">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            rows={3}
          />
        </div>

        {/* Country /State/City */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Country
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen((p) => !p)}
                className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm flex justify-between items-center focus:outline-none focus:border-[#810306]"
              >
                {formData.country || "Select country"}
                <Image
                  src="/dropdown.png"
                  alt="Dropdown"
                  width={20}
                  height={20}
                />
              </button>
              {countryOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-[#ABADB2] rounded shadow w-full z-10">
                  {Object.keys(countryStates).map((c) => (
                    <div
                      key={c}
                      onClick={() => handleCountrySelect(c)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              State/province
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStateOpen((p) => !p)}
                className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm flex justify-between items-center focus:outline-none focus:border-[#810306]"
              >
                {formData.state || "Select state"}
                <Image
                  src="/dropdown.png"
                  alt="Dropdown"
                  width={20}
                  height={20}
                />
              </button>
              {stateOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow w-full z-10">
                  {countryStates[formData.country || "Ghana"]?.map((s) => (
                    <div
                      key={s}
                      onClick={() => handleStateSelect(s)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              City
            </label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            />
          </div>
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              House Number
            </label>
            <input
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Street
            </label>
            <input
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Zip code
            </label>
            <input
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="border border-[#810306] text-[#810306] px-10 py-2 rounded-md text-sm cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-[#810306] text-white px-4 py-2 rounded-md text-sm cursor-pointer"
            onClick={handleSave}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
