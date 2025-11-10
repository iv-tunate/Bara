"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "./Logo";
import MonthDropdown from "./MonthDropdown";
import YearDropdown from "./YearDropdown";

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

type Props = {
  initial?: Experience[];
  onClose: () => void;
  onSave: (experiences: Experience[]) => void;
};

export default function AddExperienceModal({
  initial = [],
  onClose,
  onSave,
}: Props) {
  const [items, setItems] = useState<Experience[]>(
    initial.length > 0
      ? initial
      : [
          {
            org: "",
            title: "",
            startMonth: "",
            startYear: "",
            endMonth: "",
            endYear: "",
            ongoing: false,
            description: "",
          },
        ]
  );

  const updateAt = (index: number, patch: Partial<Experience>) =>
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );

  const addNew = () =>
    setItems((prev) => [
      ...prev,
      {
        org: "",
        title: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        ongoing: false,
        description: "",
      },
    ]);

  const removeAt = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const normalized = items.filter(
      (it) => it.description.trim() || it.org.trim() || it.title.trim()
    );
    onSave(normalized);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4 h-full">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-3xl relative max-h-[90vh] overflow-auto">
        <button onClick={onClose} className="absolute top-4 right-4">
          <Image src="/cancel-icon.png" alt="Close" width={20} height={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Add Experience</h2>

        <div className="space-y-4">
          {items.map((exp, idx) => (
            <div key={idx} className="p-3 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium">Experience {idx + 1}</div>
                <div className="flex gap-2">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAt(idx)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="org"
                  value={exp.org}
                  onChange={(e) => updateAt(idx, { org: e.target.value })}
                  placeholder="Organisation / Production House"
                  className="border border-gray-300 p-2 rounded w-full text-sm"
                />
                <input
                  name="title"
                  value={exp.title}
                  onChange={(e) => updateAt(idx, { title: e.target.value })}
                  placeholder="Project / Film Title"
                  className="border border-gray-300 p-2 rounded w-full text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <div>
                    <label className="text-xs text-gray-600">Start month</label>
                    <MonthDropdown
                      value={exp.startMonth}
                      onChange={(v) => updateAt(idx, { startMonth: v })}
                      placeholder="Month"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Start year</label>
                    <YearDropdown
                      value={exp.startYear}
                      onChange={(v) => updateAt(idx, { startYear: v })}
                      placeholder="Year"
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <label className="text-xs text-gray-600">End month</label>
                    <MonthDropdown
                      value={exp.endMonth}
                      onChange={(v) => updateAt(idx, { endMonth: v })}
                      placeholder="Month"
                      disabled={exp.ongoing}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">End year</label>
                    <YearDropdown
                      value={exp.endYear}
                      onChange={(v) => updateAt(idx, { endYear: v })}
                      placeholder="Year"
                      disabled={exp.ongoing}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <textarea
                  name="description"
                  value={exp.description}
                  onChange={(e) =>
                    updateAt(idx, { description: e.target.value })
                  }
                  placeholder="Describe your role or contribution (required)"
                  className="w-full border border-gray-300 p-2 rounded text-sm h-24"
                />
              </div>

              <label className="flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={exp.ongoing}
                  onChange={(e) => updateAt(idx, { ongoing: e.target.checked })}
                  className="accent-[#810306] h-4 w-4"
                />
                <span>Project is ongoing</span>
              </label>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addNew}
              className="text-[#810306] text-sm font-medium flex items-center gap-2"
            >
              <Image src="/plus-icon.png" alt="add" width={14} height={14} />
              <span>Add another experience</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#800000] text-white rounded text-sm hover:bg-[#660000]"
              >
                Save experiences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
