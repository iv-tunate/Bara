"use client";
import Image from "next/image";
import Link from "next/link";
import { Script } from "@/models/script";
import { downloadImage } from "@/utils/upload";
import { useState, useEffect } from "react";
import { getUserId } from "@/utils/tokenManager";

export const ScriptCard = ({ script }: { script: Script }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [scriptUrl, setScriptUrl] = useState("");

  useEffect(() => {
    const userId = getUserId();
    if (userId && script.writerId === userId) {
      setScriptUrl(`/writer/my-scripts/${script.id}`);
    } else {
      setScriptUrl(`/dashboard/scripts/${script.id}`);
    }
  }, [script.id, script.writerId]);

  const imgSrc = imgError
    ? "/flowery.png"
    : script.imageUrl || script.imagePublicId || "/flowery.png";

  return (
    <div className="group relative border rounded-md shadow-sm overflow-hidden transition-all duration-700 ease-in-out bg-white hover:shadow-md h-[460px] md:h-[460px] md:hover:h-[520px] flex flex-col">
      <div className="relative w-full h-48 flex-shrink-0 bg-gray-100">
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#800000]" />
          </div>
        )}

        <img
          src={imgSrc}
          alt={script.title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imgLoading ? "opacity-0" : "opacity-100"
          }`}
          onError={() => {
            setImgError(true);
            setImgLoading(false);
          }}
          onLoad={() => setImgLoading(false)}
        />

        <span className="absolute top-3 left-3 bg-[#FFEDEE] text-[#810306] text-xs px-2 py-1 rounded border border-[#810306] z-10">
          {script.genre?.map((g) => g.name).join(", ")}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        <h3 className="text-base font-bold text-[#22242A] mb-2 line-clamp-2">
          {script.title}
        </h3>

        <div className="relative overflow-hidden transition-all duration-700 ease-in-out h-28 md:group-hover:h-36 mb-2">
          <p className="text-sm text-[#333740] leading-snug">
            {script.logline}
          </p>

          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent opacity-100 md:group-hover:opacity-0 transition-opacity duration-700" />
        </div>

        <p className="text-base font-semibold text-[#333740] mb-2">
          {script.currencySymbol}
          {script.price.toLocaleString()}
        </p>

        <Link href={scriptUrl} className="mt-auto">
          <button className="w-full bg-[#800000] text-white py-2 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-700 ease-in-out">
            See more
          </button>
        </Link>
      </div>
    </div>
  );
};

interface ScriptGridProps {
  scripts: Script[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const ScriptGrid = ({
  scripts,
  isLoading,
  hasMore,
  onLoadMore,
}: ScriptGridProps) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        {scripts.map((s) => (
          <ScriptCard key={s.id} script={s} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-[#800000] text-white rounded hover:bg-[#610000] transition-colors"
          >
            {isLoading ? "Loading..." : "See More"}
          </button>
        </div>
      )}
    </>
  );
};
