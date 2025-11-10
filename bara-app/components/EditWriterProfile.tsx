"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Writer } from "@/models/user";
import { api } from "@/utils/api";
import { getCountries, getStates, getCities } from "@/utils/geoservices";

interface EditWriterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Writer) => void;
  initialData: Writer;
}

export default function EditWriterProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditWriterProfileModalProps) {
  const [formData, setFormData] = useState<Writer>(initialData);

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
    if (isOpen) setFormData(initialData);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleSave = async () => {
    try {
      setLoading(true);
      // const updated = await api.updateWriterProfile(formData);
      // onSave?.(updated);
      onSave?.(formData);
      onClose();
    } catch (err) {
      console.error("Error updating writer profile:", err);
      alert("Failed to update profile. Please try again later.");
    } finally {
      setLoading(false);
    }
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
          <Image src="/Arrow_left.png" alt="Back" width={20} height={20} />
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
              value={formData.name || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#22242A]">
              Portfolio
            </label>
            <input
              name="portfolioUrl"
              value={formData.portfolioUrl || ""}
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
            value={formData.bio || ""}
            onChange={handleChange}
            className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm focus:outline-none focus:border-[#810306]"
            rows={3}
          />
        </div>

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
              State/province
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
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
              Zip code
            </label>
            <input
              name="postalCode"
              value={formData.address?.postalCode || ""}
              onChange={handleChange}
              className="border border-[#ABADB2] rounded px-3 py-2 w-full text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="border border-[#810306] text-[#810306] px-10 py-2 rounded-md text-sm cursor-pointer"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-[#810306] text-white px-4 py-2 rounded-md text-sm cursor-pointer disabled:opacity-70"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
