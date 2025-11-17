
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-[#22242A]">
            Select from Catalog
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-auto flex-1">
          {catalogImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-base font-medium mb-2">No catalog images available yet</p>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Add your cover image catalog by placing images in <code className="bg-gray-100 px-2 py-1 rounded text-xs">public/catalog/</code> and updating the <code className="bg-gray-100 px-2 py-1 rounded text-xs">catalogImages</code> array in this component.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {catalogImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onSelect(img.src, img.name)}
                  className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#800000] hover:shadow-lg transition-all"
                >
                  <div className="relative w-full aspect-video">
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="p-3 text-sm text-center text-[#22242A] font-medium">
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