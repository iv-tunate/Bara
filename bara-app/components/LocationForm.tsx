"use client";

import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getCountries, getStates, getCities } from "@/utils/geoservices";

interface LocationFormProps {
  form: {
    country: string;
    state: string;
    city: string;
    street: string;
    postalCode: string;
    additionalDetails: string;
  };
  setForm: Dispatch<
    SetStateAction<{
      country: string;
      state: string;
      city: string;
      street: string;
      zipCode: string;
      additionalDetails: string;
    }>
  >;
}

export default function LocationForm({ form, setForm }: LocationFormProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

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
  if (!form.country) return;

  const loadStates = async () => {
    try {
      const data = await getStates(form.country);
      setStates(data);
      if (!data.includes(form.state)) {
        setForm((prev) => ({ ...prev, state: "", city: "" }));
      }
    } catch (e) {
      console.error("Failed to fetch states", e);
    }
  };

  loadStates();
}, [form.country]);

useEffect(() => {
  if (!form.state || !form.country) return;

  const loadCities = async () => {
    try {
      const data = await getCities(form.country, form.state);
      setCities(data);
      if (!data.includes(form.city)) {
        setForm((prev) => ({ ...prev, city: "" }));
      }
    } catch (e) {
      console.error("Failed to fetch cities", e);
    }
  };

  loadCities();
}, [form.state]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="text-[#22242A] text-sm mt-8">
      {/* First row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Country */}
        <div className="flex flex-col">
          <label htmlFor="country" className="mb-1 font-medium">
            Country
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Image
                src="/Nigerian flag.png"
                alt="Flag"
                width={20}
                height={14}
              />
            </div>

            <select
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full border border-[#ABADB2] rounded-md px-10 py-2 appearance-none bg-white text-sm"
            >
              {loadingCountries && <option>Loading…</option>}
              {!loadingCountries && countries.length === 0 && (
                <option value="Nigeria">Nigeria</option>
              )}
              {!loadingCountries &&
                countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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
          <label htmlFor="state" className="mb-1 font-medium">
            State / Province
          </label>
          <select
            id="state"
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2"
          >
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="flex flex-col">
          <label htmlFor="city" className="mb-1 font-medium">
            City
          </label>
          <select
            id="city"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2"
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Street */}
        <div className="flex flex-col md:col-span-6">
          <label htmlFor="street" className="mb-1 font-medium">
            Street
          </label>
          <input
            id="street"
            name="street"
            value={form.street}
            onChange={handleChange}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2"
          />
        </div>

        {/* Zip code */}
        <div className="flex flex-col md:col-span-6">
          <label htmlFor="zipCode" className="mb-1 font-medium">
            Postal code
          </label>
          <input
            id="postalCode"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2"
          />
        </div>
      </div>
      {/* Additional details */}
      <div className="flex flex-col md:col-span-3 mt-4">
        <label htmlFor="additionalDetails" className="mb-1 font-medium">
          Additional details (optional)
        </label>
        <input
          id="additionalDetails"
          name="additionalDetails"
          value={form.additionalDetails}
          onChange={handleChange}
          className="w-full border border-[#ABADB2] rounded-md px-3 py-2"
          placeholder="Apartment, suite, etc."
        />
      </div>
    </div>
  );
}
