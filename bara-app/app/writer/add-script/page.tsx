"use client";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import { getUserSession } from "@/utils/tokenManager";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import AiImageGeneratorModal from "@/components/AiImageModal";
import ImageCatalogModal from "@/components/ImageCatalogModal";
import { uploadImage } from "@/utils/upload";
import { PageGaurd } from "@/app/hooks/pageguard";
const IPDealOptions = [
  { label: "Writer retains all rights", value: "WriterRetainsRights" },
  { label: "Producer retains all rights", value: "ProducerRetainsRights" },
  { label: "Rights are shared", value: "SharedRights" },
];

const currencyOptions = [
  { label: "₦ NGN", value: "NAIRA" },
  { label: "$ USD", value: "USD" },
  { label: "€ EUR", value: "EUR" },
  { label: "£ GBP", value: "GBP" },
];

const registrationBodies = [
  "Writers Guild of America (WGA)",
  "U.S. Copyright Office",
  "UK Writers' Guild",
  "European Copyright Office",
  "Nigerian Copyright Commission (NCC)",
  "South African Copyright Office",
  "Canadian Intellectual Property Office",
  "Australian Copyright Agency",
  "Other",
];

export default function AddScriptPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);

  const [logline, setLogline] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [ownership, setOwnership] = useState("");
  const [currency, setCurrency] = useState("NAIRA");
  const [price, setPrice] = useState("");

  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationBody, setRegistrationBody] = useState("");

  const [isOriginal, setIsOriginal] = useState(false);
  const [agreeCommission, setAgreeCommission] = useState(false);
  const [copyrightNumber, setCopyrightNumber] = useState<string | null>(null);
  const [scriptFile, setScriptFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);

  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showAiImageModal, setShowAiImageModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaPublicId, setMediaPublicId] = useState("");
  const [mediaUploading, setMediaUploading] = useState(false);

  const scriptInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
      setRole(session.userType);
      setUserId(session.userId);
      PageGaurd(session);
    (async () => {
      try {
        const res = await api.getGenres();
        const list = res?.data?.data ?? res?.data ?? [];
        setAvailableGenres(list);
      } catch {
        toast.error("Failed to load genres");
      }
    })();
  }, []);

    useEffect(() => {
      return () => {
        if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      };
    }, [mediaPreviewUrl]);
  const handleBrowseScript = () => scriptInputRef.current?.click();
  const handleBrowseImage = () => imageInputRef.current?.click();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));

    try {
      const session = getUserSession();
      if (!session || !session.userId) {
        toast.error("Please login to upload images");
        return;
      }

      const user = {
        name: session.name,
        id: session.userId,
      };

      setMediaUploading(true);

      const result = await uploadImage(file, "Writer", user);

      setMediaUrl(result.url);
      setMediaPublicId(result.publicId || "");

      toast.success("Cover image uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload cover image");
    } finally {
      setMediaUploading(false);
    }
  };

  const handleScriptChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      toast.error("Image too large. Maximum allowed size is 100KB.");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Only PDF, DOC, DOCX allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max script size is 10MB");
      return;
    }

    setScriptFile(file);
  };

  //const handleImageChange = (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   if (
  //     !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
  //       file.type
  //     )
  //   ) {
  //     toast.error("Only PNG, JPEG, JPG, WEBP allowed");
  //     return;
  //   }

  //   setMediaFile(file);
  //   if (mediaPreviewUrl) {
  //     URL.revokeObjectURL(mediaPreviewUrl);
  //   }
  //   setMediaPreviewUrl(URL.createObjectURL(file));
  // };

  const handleCatalogSelect = async (url, name) => {
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const file = new File([blob], name ?? "catalog-image.jpg", {
        type: blob.type || "image/jpeg",
      });
      setMediaFile(file);
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
      setMediaPreviewUrl(URL.createObjectURL(file));
      setShowCatalogModal(false);
    } catch (err) {
      console.error("Catalog image error:", err);
      toast.error("Failed to load catalog image");
    }
  };

  const toggleSelectGenre = (g) => {
    setSelectedGenres((prev) =>
      prev.some((x) => x.id === g.id)
        ? prev.filter((x) => x.id !== g.id)
        : prev.length < 5
        ? [...prev, g]
        : (toast.error("Max 5 genres"), prev)
    );
  };

  const isFormComplete =
    title &&
    selectedGenres.length > 0 &&
    logline &&
    synopsis &&
    ownership &&
    price &&
    scriptFile &&
    mediaFile &&
    isOriginal &&
    agreeCommission;

  const handleSubmit = async () => {
    if (!isFormComplete) {
      toast.error("Complete all required fields");
      return;
    }

    // const session = getUserSession();
    // if (!session || !session.userId) {
    //   toast.error("Session expired. Please login again");
    //   router.push("/auth/login");
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("Title", title);

      selectedGenres.forEach((genre, index) => {
        fd.append(`GenreId[${index}]`, genre.id);
      });
      if (mediaUrl) fd.append("CoverImageUrl", mediaUrl);
      if (mediaPublicId) fd.append("CoverImagePublicId", mediaPublicId);

      fd.append("Logline", logline);
      fd.append("Synopsis", synopsis);
      fd.append("Price", price.toString());
      fd.append("Currency", currency);
      fd.append("IsScriptRegistered", isRegistered.toString());
      if (isRegistered && registrationBody) {
        fd.append("RegistrationBody", registrationBody);
      }
      fd.append("OwnershipRights", ownership);
      fd.append("File", scriptFile);
      if (copyrightNumber) {
        fd.append("CopyrightRegistrationNumber", copyrightNumber);
      }

      //  console.log("FormData contents:");
      //  for (let pair of fd.entries()) {
      //    console.log(pair[0], pair[1]);
      //  }

      const res = await api.addScript(fd, userId);
      console.log("Add script response:", res);

      if (res?.success) {
        toast.success("Script added successfully");
        router.push(`/writer/profile`);
      } else {
        if (
          res?.statusCode === 401 ||
          res?.message?.toLowerCase().includes("unauthorized") ||
          res?.message?.toLowerCase().includes("token")
        ) {
          toast.error("Session expired. Please login again");
          router.push("/auth/login");
        } else {
          toast.error(res?.message ?? "Error uploading script");
        }
      }
    } catch (err: any) {
      console.error("Submit error:", err);

      if (err?.status === 401 || err?.response?.status === 401) {
        toast.error("Session expired. Please login again");
        router.push("/auth/login");
      } else {
        toast.error(err?.message ?? "Unexpected error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardNavbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#22242A] mb-6 text-center">
          Add Script
        </h1>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Logline + Synopsis */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Logline</label>
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Synopsis</label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm h-24 resize-none"
            />
          </div>
        </div>

        {/* Genre + Ownership */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Genre</label>

            <button
              type="button"
              onClick={() => setGenreOpen((x) => !x)}
              className="w-full"
            >
              <input
                readOnly
                value={selectedGenres.map((g) => g.name).join(", ")}
                placeholder="Select up to 5 genres"
                className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm bg-white cursor-pointer"
              />
              <div className="absolute right-3 top-[70%] -translate-y-1/2 text-xs text-[#858990] pointer-events-none">
                {selectedGenres.length}/5
              </div>
            </button>

            {genreOpen && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#ABADB2] rounded-md shadow-lg max-h-48 overflow-auto z-50">
                {availableGenres.map((g) => {
                  const active = selectedGenres.some((s) => s.id === g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => toggleSelectGenre(g)}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#F5F5F5] ${
                        active ? "bg-[#F5F5F5] font-medium" : ""
                      }`}
                    >
                      {g.name}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedGenres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedGenres.map((g) => (
                  <div
                    key={g.id}
                    className="inline-flex items-center gap-1.5 bg-[#F5F5F5] px-2.5 py-1 rounded text-sm"
                  >
                    <span>{g.name}</span>
                    <button
                      onClick={() =>
                        setSelectedGenres((prev) =>
                          prev.filter((x) => x.id !== g.id)
                        )
                      }
                      className="text-[#800000] hover:text-black font-bold text-base"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              IP Ownership terms
            </label>
            <select
              value={ownership}
              onChange={(e) => setOwnership(e.target.value)}
              className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
            >
              <option value="">Select ownership</option>
              {IPDealOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price + Registration */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-[#ABADB2] rounded-md px-2 py-2 text-sm"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {isRegistered && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Registration body
              </label>
              <select
                value={registrationBody}
                onChange={(e) => setRegistrationBody(e.target.value)}
                className="w-full border border-[#ABADB2] rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select registration body</option>
                {registrationBodies.map((body) => (
                  <option key={body} value={body}>
                    {body}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Registered? */}
        <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isRegistered}
            onChange={(e) => setIsRegistered(e.target.checked)}
            className="accent-[#800000]"
          />
          Is this a registered script?
        </label>

        {/* Cover Image */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-[#22242A]">
              Upload Cover Image *
            </label>

            <span
              onClick={() => setShowAiImageModal(true)}
              className="flex items-center text-xs font-bold text-[#800000] cursor-pointer hover:underline"
            >
              Generate with AI
              <Image
                src="/star.png"
                alt=""
                width={10}
                height={10}
                className="ml-1"
              />
            </span>
          </div>

          <p className="text-xs italic text-gray-500 my-2">
            A cover image helps producers visualize the tone of your story.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageChange({ target: { files: [file] } });
            }}
            className={`relative w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer bg-[#F5F5F5] ${
              dragActive ? "ring-2 ring-[#810306]/40" : ""
            }`}
            onClick={handleBrowseImage}
          >
            {/* === Image Thumbnail Preview === */}
            {mediaPreviewUrl && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center">
                <Image
                  src={mediaPreviewUrl}
                  alt="Selected"
                  width={128}
                  height={128}
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    URL.revokeObjectURL(mediaPreviewUrl);
                    setMediaFile(null);
                    setMediaPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-[#800000] text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-[#660000] shadow-lg"
                >
                  ×
                </button>
              </div>
            )}

            {/* === Placeholder / Instructions === */}
            <div
              className={`text-center ${
                mediaPreviewUrl ? "absolute opacity-0" : ""
              }`}
            >
              <p className="text-sm text-[#333740]">Drag & drop (PNG, JPG)</p>
              <p className="text-sm text-[#333740] mt-1">
                or <span className="text-[#810306] font-semibold">Browse</span>{" "}
                or{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCatalogModal(true);
                  }}
                  className="text-[#810306] font-semibold hover:underline"
                >
                  Choose from gallery
                </button>
              </p>
            </div>

            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Script Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#22242A] mb-1">
            Upload script *
          </label>

          {scriptFile ? (
            <div
              onClick={handleBrowseScript}
              className="w-full h-32 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
            >
              <p className="text-sm font-medium">{scriptFile.name}</p>
              <p className="text-xs text-gray-600 mt-1">
                {(scriptFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-[#800000] font-semibold mt-2">
                Click to change file
              </p>
            </div>
          ) : (
            <div
              onClick={handleBrowseScript}
              className="w-full h-32 border-2 border-dashed border-[#ABADB2] rounded-md bg-[#F5F5F5] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
            >
              <p className="text-sm">Drag & drop PDF/DOC/DOCX</p>
              <p className="text-sm mt-1 text-[#810306] font-semibold">
                Browse
              </p>
            </div>
          )}

          <input
            ref={scriptInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleScriptChange}
            className="hidden"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#22242A] mb-1">
            Copyright Registration Number{" "}
            <span className="text-gray-400">(optional)</span>
          </label>

          <input
            type="text"
            value={copyrightNumber ?? ""}
            onChange={(e) => setCopyrightNumber(e.target.value)}
            placeholder="e.g. WGA-123456 or NCC-2024-XYZ"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Agreements */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isOriginal}
              onChange={(e) => setIsOriginal(e.target.checked)}
              className="accent-[#800000]"
            />
            I agree this script is my original work
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={agreeCommission}
              onChange={(e) => setAgreeCommission(e.target.checked)}
              className="accent-[#800000]"
            />
            I agree to Bara's 15% commission on successful sales
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            className={`w-full sm:w-80 md:w-96 py-3 rounded-md text-sm font-medium ${
              !isFormComplete || isSubmitting
                ? "bg-[#DADBDD] text-[#858990] cursor-not-allowed"
                : "bg-[#800000] text-white hover:bg-[#660000]"
            }`}
          >
            {isSubmitting ? "Adding script..." : "Add script"}
          </button>
        </div>

        {/* Modals */}
        {showCatalogModal && (
          <ImageCatalogModal
            onSelect={handleCatalogSelect}
            onClose={() => setShowCatalogModal(false)}
          />
        )}

        {showAiImageModal && (
          <AiImageGeneratorModal
            title={title}
            logline={logline}
            synopsis={synopsis}
            onGenerate={(file, url) => {
              setMediaFile(file);
              if (mediaPreviewUrl) {
                URL.revokeObjectURL(mediaPreviewUrl);
              }
              setMediaPreviewUrl(url);
              setShowAiImageModal(false);
            }}
            onClose={() => setShowAiImageModal(false)}
          />
        )}
      </main>
    </div>
  );
}
