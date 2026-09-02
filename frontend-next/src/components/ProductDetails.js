/*
=========================================================
PRODUCT DETAILS
=========================================================

Responsibility:
- Manage product-page state
- Normalize API product data
- Handle loading and error states
- Compose product UI modules

This component does NOT perform API calls.

=========================================================
*/

"use client";

import { useEffect, useState } from "react";

import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductLoading from "@/components/product/ProductLoading";

/*
=========================================================
PRODUCT NORMALIZER
=========================================================

Backend currently provides:
- id
- category
- category_name
- name
- slug
- description
- price
- stock
- image_url
- is_active

Coffee-specific fields are intentionally not fabricated.
=========================================================
*/

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  const stock = Number(product.stock || 0);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : product.image_url
        ? [product.image_url]
        : [];

  return {
    ...product,

    name: product.name || "محصول",

    category_name:
      product.category_name ||
      product.category ||
      "دسته‌بندی",

    description: product.description || "",

    price:
      product.price !== undefined && product.price !== null
        ? Number(product.price)
        : 0,

    stock,

    available:
      Boolean(product.is_active) && stock > 0,

    images,
  };
}

/*
=========================================================
ERROR VIEW
=========================================================
*/

function ProductError({ error }) {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f4ef] px-4 py-10 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-[#2d211d]">
            خطا در دریافت محصول
          </h1>

          <p className="mt-3 text-sm text-[#756961]">
            {error?.message ||
              "امکان دریافت اطلاعات محصول وجود ندارد."}
          </p>
        </div>
      </div>
    </main>
  );
}

/*
=========================================================
PRODUCT DETAILS
=========================================================
*/

export default function ProductDetails({
  product = null,
  loading = false,
  error = null,
}) {
  const normalizedProduct = normalizeProduct(product);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  /*
  -------------------------------------------------------
  Reset image and quantity when product changes
  -------------------------------------------------------
  */

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [normalizedProduct?.id]);

  /*
  -------------------------------------------------------
  Quantity Controls
  -------------------------------------------------------
  */

  const increaseQuantity = () => {
    setQuantity((current) => {
      const stock = Number(normalizedProduct?.stock || 0);

      if (stock <= 0) {
        return 1;
      }

      return Math.min(current + 1, stock);
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  /*
  -------------------------------------------------------
  Loading
  -------------------------------------------------------
  */

  if (loading) {
    return <ProductLoading />;
  }

  /*
  -------------------------------------------------------
  Error
  -------------------------------------------------------
  */

  if (error) {
    return <ProductError error={error} />;
  }

  /*
  -------------------------------------------------------
  Empty Product Guard
  -------------------------------------------------------
  */

  if (!normalizedProduct) {
    return <ProductLoading />;
  }

  /*
  -------------------------------------------------------
  Main UI
  -------------------------------------------------------
  */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f4ef] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <ProductBreadcrumb product={normalizedProduct} />

        <section className="overflow-hidden rounded-[32px] border border-[#e6dfd8] bg-white shadow-[0_15px_50px_rgba(70,45,30,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <ProductGallery
              product={normalizedProduct}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />

            <ProductInfo
              product={normalizedProduct}
              quantity={quantity}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          </div>
        </section>
      </div>
    </main>
  );
}