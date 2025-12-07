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
    if (droppedFile && (droppedFile.type === 'image/jpeg' || droppedFile.type === 'image/png')) {
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
    if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png')) {
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
  }

  return (
    <main className="min-h-screen bg-white">
      <DashboardNavbar />

      <div className="py-3 w-full max-w-2xl mx-30 flex flex-col">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl mb-4">
            We are happy to{" "}
            <span className="bg-yellow-300 px-2 py-1/2 rounded-sm">help</span>
          </h1>
          <p className="mb-6">
            Our team is ready to support you with any questions or technical
            issues. Send us a message and we’ll get back to you soon.
          </p>
        </div>

        {/* Contact Form */}
        <div>
          <form action="">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email address"
              className="block w-full border-2 border-[#ABADB2] outline-none rounded-md p-2 mb-4"
            />
            <label htmlFor="phone">Phone number</label>
            <input
              type="tel"
              id="phone"
              placeholder="Enter phone number"
              className="block w-full border-2 border-[#ABADB2] outline-none rounded-md p-2 mb-4"
            />
            <label htmlFor="issue-type">Issue type</label>
            <div className="relative">
              <select
                name="issue-type"
                id="issue-type"
                className="block w-full border-2 border-[#ABADB2] outline-none rounded-md p-2 mb-4 appearance-none cursor-pointer"
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
              <Image
                className="pointer-events-none absolute top-5 left-[42vw]"
                src="/chevron-down.svg"
                alt="dropdown"
                height={10}
                width={10}
              />
            </div>

            <label htmlFor="description">Describe your issue</label>
            <textarea
              name="description"
              id="description"
              className="block w-full h-35 border-2 border-[#ABADB2] rounded-md p-2 mb-4 outline-none resize-none"
            ></textarea>

            <h3 className="mb-2">Upload image</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex justify-center w-full h-40 px-4 transition border-2 border-dashed rounded-md appearance-none focus:outline-none mb-4 ${
                isDraggingOver ? 'border-gray-400 bg-gray-100' : 'bg-[#F5F5F5] border-[#ABADB2]'
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center">
                    <p className="font-medium text-gray-700">File selected:</p>
                    <p className="text-sm text-gray-500">{file.name}</p>
                    <button type="button" onClick={handleRemoveFile} className="mt-2 text-sm font-semibold text-red-600 hover:underline">Remove</button>
                </div>
              ) : (
                <label htmlFor="upload-image" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-600 text-center text-[#333740]">
                      Drag and drop file (png, jpeg) here, <br />
                      <span className="text-red-800 underline">or Browse</span>
                    </p>
                  </div>
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

            {/* Buttons Section */}
            <div className="flex flex-row justify-between">
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
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
