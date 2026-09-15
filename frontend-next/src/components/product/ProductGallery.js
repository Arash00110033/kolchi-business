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

import { useI18n } from "@/i18n";

export default function ProductGallery({
  product,
  selectedImage,
  onSelectImage,
}) {
  const { t } = useI18n();

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
    <div className="order-1 border-b border-[var(--theme-border)] p-5 sm:p-8 lg:order-1 lg:border-b-0 lg:border-l">
      {/* Main Image */}

      <div className="relative aspect-square overflow-hidden rounded-[26px] bg-[var(--theme-surface-muted)]">
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name || t("common.image")}
            className="h-full w-full object-contain p-8 transition duration-300 hover:scale-[1.03] sm:p-12"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--theme-muted)]">
            {t("common.image")}
          </div>
        )}

        {/* Availability Badge */}

        {product.available && (
          <div className="absolute right-4 top-4 rounded-full bg-[color-mix(in srgb, var(--theme-success) 12%, white)] px-4 py-2 text-sm font-medium text-[var(--theme-success)]">
            {t("common.available")}
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
            aria-label={`${t("common.image")} ${index + 1}`}
                aria-pressed={isSelected}
                className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-[var(--theme-background)] transition ${
                  isSelected
                    ? "border-[var(--theme-secondary)]"
                    : "border-transparent hover:border-[var(--theme-secondary)]"
                }`}
              >
                <img
                  src={image}
            alt={`${product.name || t("common.product")} - ${t("common.image")} ${index + 1}`}
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
