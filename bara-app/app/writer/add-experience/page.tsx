"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/components/Logo";
import MonthDropdown from "@/components/MonthDropdown";
import YearDropdown from "@/components/YearDropdown";

export default function AddExperiencePage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState([
    {
      org: "",
      title: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      ongoing: false,
    },
  ]);

  const handleChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updated = [...experiences];
    (updated[index] as any)[field] = value;
    setExperiences(updated);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        org: "",
        title: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        ongoing: false,
      },
    ]);
  };

  const removeExperience = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
  };

  const handleCancel = () => {
    router.push("/profile/setup/writer");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0000] bg-opacity-80 p-4">
      <div className="relative bg-white rounded-lg shadow-lg p-6 md:p-10 w-full max-w-2xl space-y-6 overflow-auto">
        {/* Cancel Icon (top-right) */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4"
          aria-label="Cancel"
        >
          <Image src="/cancel-icon.png" alt="cancel" width={20} height={20} />
        </button>

        <Logo />

        <h1 className="text-xl md:text-2xl font-medium text-[#22242A] mb-6">
          Add Experience
        </h1>

        {experiences.map((exp, index) => (
          <div
            key={index}
            className="space-y-6 pb-6 border-b border-gray-200 last:border-b-0"
          >
            {/* Organisation / Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Organisation / Production House
                </label>
                <input
                  type="text"
                  value={exp.org}
                  onChange={(e) => handleChange(index, "org", e.target.value)}
                  className="border border-[#ABADB2] p-2 rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Project / Film Title
                </label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  className="border border-[#ABADB2] p-2 rounded-md"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Start Date (month)
                </label>
                <MonthDropdown
                  value={exp.startMonth}
                  onChange={(val) => handleChange(index, "startMonth", val)}
                  placeholder="Month"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  Start Date (year)
                </label>
                <YearDropdown
                  value={exp.startYear}
                  onChange={(val) => handleChange(index, "startYear", val)}
                  placeholder="Year"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  End Date (month)
                </label>
                <MonthDropdown
                  value={exp.endMonth}
                  onChange={(val) => handleChange(index, "endMonth", val)}
                  placeholder="Month"
                  disabled={exp.ongoing}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-[#22242A] mb-1">
                  End Date (year)
                </label>
                <YearDropdown
                  value={exp.endYear}
                  onChange={(val) => handleChange(index, "endYear", val)}
                  placeholder="Year"
                  disabled={exp.ongoing}
                />
              </div>
            </div>

            {/* Ongoing Checkbox */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={exp.ongoing}
                onChange={(e) =>
                  handleChange(index, "ongoing", e.target.checked)
                }
                className="h-4 w-4 accent-[#810306]"
              />
              <label className="text-sm text-[#22242A]">
                This project is ongoing
              </label>
            </div>

            {/* Remove Button */}
            {experiences.length > 1 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 text-sm font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Experience link (aligned right) */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addExperience}
            className="flex items-center gap-1 text-[#810306] font-semibold cursor-pointer text-sm mt-4"
          >
            <Image src="/plus-icon.png" alt="add" width={16} height={16} />
            <span>Add Experience</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border-2 border-[#810306] text-[#810306] rounded-md font-semibold"
          >
            Cancel
          </button>
          <button className="px-6 py-2 rounded-md font-semibold bg-[#810306] text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
