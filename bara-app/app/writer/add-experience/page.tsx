"use client";

import Logo from "@/components/Logo";


export default function AddExperiencePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a0000] bg-opacity-80 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-10 w-full max-w-2xl space-y-6 overflow-auto">
        <Logo />

        <h1 className="text-xl md:text-2xl font-medium text-[#22242A] mb-6">
          Add Experience
        </h1>

        {/* Organisation / Product */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#22242A] mb-1">
              Organisation / Production Name
            </label>
            <input
              type="text"
              className="border border-[#ABADB2] p-2 rounded-md"
              placeholder="Enter organisation name"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#22242A] mb-1">
              Product / Film Title
            </label>
            <input
              type="text"
              className="border border-[#ABADB2] p-2 rounded-md"
              placeholder="Enter product title"
            />
          </div>
        </div>

        {/* Start Date Month / Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#22242A] mb-1">
              Start Month
            </label>
            <input
              type="text"
              className="border border-[#ABADB2] p-2 rounded-md"
              placeholder="e.g. January"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#22242A] mb-1">
              Start Year
            </label>
            <input
              type="text"
              className="border border-[#ABADB2] p-2 rounded-md"
              placeholder="e.g. 2023"
            />
          </div>
        </div>

        {/* End Date Month / Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#22242A] mb-1">
              End Month
            </label>
            <input
              type="text"
              className="border border-[#ABADB2] p-2 rounded-md"
              placeholder="e.g. December"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#22242A] mb-1">
              End Year
            </label>
            <input
              type="text"
              className="border border-[#ABADB2] p-2 rounded-md"
              placeholder="e.g. 2024"
            />
          </div>
        </div>

        {/* Ongoing Checkbox */}
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" className="h-4 w-4 accent-[#810306]" />
          <label className="text-sm text-[#22242A]">
            This project is ongoing
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button className="px-6 py-2 border-2 border-[#810306] text-[#810306] rounded-md font-semibold">
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
