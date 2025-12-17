"use client";

import Link from "next/link";
import Image from "next/image";
import DashboardNavbar from "@/components/DashboardNavbar";
import React, { useState, useRef } from "react";

export default function HelpPage() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "image/jpeg" || droppedFile.type === "image/png")) {
      setFile(droppedFile);
      if (inputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        inputRef.current.files = dataTransfer.files;
      }
    } else {
      alert("Please drop a PNG or JPG file.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert("Please select a PNG or JPG file.");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="py-6 px-4 sm:px-6 lg:px-8 w-full max-w-3xl mx-auto flex flex-col gap-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl mb-4 font-semibold">
            We are happy to help
          </h1>
          <p className="text-sm sm:text-base mb-2">
            Our team is ready to support you with any questions or technical
            issues. Send us a message and we’ll get back to you soon.
          </p>
        </div>

        {/* Contact Form */}
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email address"
              className="block w-full border-2 border-[#ABADB2] outline-none rounded-md p-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone">Phone number</label>
            <input
              type="tel"
              id="phone"
              placeholder="Enter phone number"
              className="block w-full border-2 border-[#ABADB2] outline-none rounded-md p-2"
            />
          </div>

         
          <div className="flex flex-col gap-2 relative">
  <label htmlFor="issue-type">Issue type</label>
  <select
    name="issue-type"
    id="issue-type"
    className="block w-full border-2 border-[#ABADB2] outline-none rounded-md p-2 pr-10 appearance-none cursor-pointer"
  >
    <option value="" disabled selected>
      Select an issue
    </option>
    <option value="account-login">Account or login issues</option>
    <option value="payment-wallet">Payments & wallet</option>
    <option value="script">Script upload or download</option>
    <option value="copyright">Copyright or IP concerns</option>
    <option value="others">Others</option>
  </select>

  {/* Custom dropdown icon */}
  <div className="pointer-events-none absolute right-3 top-[55%] translate-y-[-50%]">
    <Image src="/chevron-down.svg" alt="dropdown" width={16} height={16} />
  </div>
</div>


          <div className="flex flex-col gap-2">
            <label htmlFor="description">Describe your issue</label>
            <textarea
              name="description"
              id="description"
              className="block w-full h-32 sm:h-40 border-2 border-[#ABADB2] rounded-md p-2 outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="mb-2">Upload image</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex justify-center items-center w-full h-40 px-4 transition border-2 border-dashed rounded-md mb-4 ${
                isDraggingOver ? "border-gray-400 bg-gray-100" : "bg-[#F5F5F5] border-[#ABADB2]"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="font-medium text-gray-700">File selected:</p>
                  <p className="text-sm text-gray-500">{file.name}</p>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="mt-2 text-sm font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="upload-image"
                  className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-center"
                >
                  <p className="font-medium text-gray-600">
                    Drag and drop file (png, jpeg) here, <br />
                    <span className="text-red-800">or Browse</span>
                  </p>
                </label>
              )}
              <input
                ref={inputRef}
                onChange={handleChange}
                type="file"
                id="upload-image"
                name="upload-image"
                accept=".jpeg, .png"
                className="hidden"
              />
            </div>
          </div>

          {/* Buttons Section */}
         
              {/* <div className="flex flex-row justify-between">
              <Link href="/">
                <button className="bg-[#F5F5F5] text-[#858990] w-80 px-5 py-2 rounded-md font-semibold border-2 border-transparent hover:border-[#858990] transition-colors">
                  Go Home
                </button>
              </Link>
              <Link href="/help">
                <button
                  type="submit"
                  className="bg-[#F5F5F5] text-[#858990] w-80 px-5 py-2 rounded-md font-semibold border-2 border-transparent hover:border-[#858990] transition-colors"
                >
                  Submit another response
                </button>
              </Link>
            </div> */}
            <div className="flex flex-col gap-2 relative">
  <label htmlFor="issue-type">Issue type</label>
  <select
    name="issue-type"
    id="issue-type"
    className="block w-full border-2 border-[#ABADB2] outline-none rounded-md p-2 pr-10 text-sm sm:text-base md:text-lg appearance-none cursor-pointer"
  >
    <option value="" disabled selected>
      Select an issue
    </option>
    <option value="account-login">Account or login issues</option>
    <option value="payment-wallet">Payments & wallet</option>
    <option value="script">Script upload or download</option>
    <option value="copyright">Copyright or IP concerns</option>
    <option value="others">Others</option>
  </select>

  {/* Custom dropdown icon */}
  <div className="pointer-events-none absolute right-3 top-[55%] translate-y-[-50%]">
    <Image src="/chevron-down.svg" alt="dropdown" width={16} height={16} />
  </div>
</div>

<div className="flex flex-col sm:flex-row sm:justify-start sm:gap-4 gap-3 mt-4 lg:justify-between">
  <Link href="/">
    <button className="w-full sm:w-auto px-6 py-2 rounded-md font-semibold border-2 border-transparent bg-[#F5F5F5] text-[#858990] hover:border-[#858990] transition-colors">
      Go Home
    </button>
  </Link>
  <Link href="/help">
    <button className="w-full sm:w-auto px-6 py-2 rounded-md font-semibold border-2 border-transparent bg-[#F5F5F5] text-[#858990] hover:border-[#858990] transition-colors">
      Submit another response
    </button>
  </Link>
</div>




        </form>
      </div>
    </main>
  );
}
