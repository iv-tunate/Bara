
const catalogImages = [
  // { id: "1", name: "Action Scene", src: Image1 },
  // { id: "2", name: "Drama Moment", src: Image2 },
];

interface ImageCatalogModalProps {
  onSelect: (imageSrc: string, imageName: string) => void;
  onClose: () => void;
}

export default function ImageCatalogModal({
  onSelect,
  onClose,
}: ImageCatalogModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#22242A]">
            Select from Catalog
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {catalogImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No catalog images available yet.</p>
              <p className="text-xs mt-2">
                Add images to public/ScriptImages and import them in this
                component.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {catalogImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onSelect(img.src, img.name)}
                  className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#800000] transition-all"
                >
                  <img
                    src={img.src}
                    alt={img.name}
                    className="w-full aspect-video object-cover"
                  />
                  <p className="p-2 text-sm text-center text-[#22242A]">
                    {img.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}