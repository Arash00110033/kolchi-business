/*
=========================================================
PRODUCT GALLERY
=========================================================

Responsibility:
- Display the main product image
- Display image thumbnails
- Handle image selection
- Display product availability

This component contains UI only.
No API calls or business logic are performed here.

=========================================================
*/

export default function ProductGallery({
  product,
  selectedImage,
  onSelectImage,
}) {
  /*
  -------------------------------------------------------
  Guard
  -------------------------------------------------------
  */

  if (!product) {
    return null;
  }

  /*
  -------------------------------------------------------
  Normalize Images
  -------------------------------------------------------
  */

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];

  /*
  -------------------------------------------------------
  Selected Image
  -------------------------------------------------------
  */

  const currentImage = images[selectedImage];

  /*
  -------------------------------------------------------
  Render
  -------------------------------------------------------
  */

  return (
    <div className="order-1 border-b border-[#eee8e2] p-5 sm:p-8 lg:order-1 lg:border-b-0 lg:border-l">
      {/* Main Image */}

      <div className="relative aspect-square overflow-hidden rounded-[26px] bg-[#f5f1ec]">
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name || "تصویر محصول"}
            className="h-full w-full object-contain p-8 transition duration-300 hover:scale-[1.03] sm:p-12"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#a49a93]">
            تصویر محصول موجود نیست
          </div>
        )}

        {/* Availability Badge */}

        {product.available && (
          <div className="absolute right-4 top-4 rounded-full bg-[#e7f2e7] px-4 py-2 text-sm font-medium text-[#356139]">
            موجود و آماده ارسال
          </div>
        )}
      </div>

      {/* Thumbnails */}

      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          {images.map((image, index) => {
            const isSelected = selectedImage === index;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => onSelectImage(index)}
                aria-label={`نمایش تصویر ${index + 1}`}
                aria-pressed={isSelected}
                className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-[#f7f3ee] transition ${
                  isSelected
                    ? "border-[#6b4030]"
                    : "border-transparent hover:border-[#cdb8a9]"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name || "محصول"} - تصویر ${
                    index + 1
                  }`}
                  className="h-full w-full object-contain p-3"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}