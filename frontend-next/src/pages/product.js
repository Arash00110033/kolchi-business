/*
=========================================================
PRODUCT PAGE
=========================================================

مسئولیت:
- دریافت محصول از API
- مدیریت Loading
- مدیریت Error
- ارسال محصول به ProductDetails

API:
GET /api/v1/products/ethiopian/

این فایل فقط مسئول اتصال Page به Service است.
UI اصلی داخل ProductDetails و ماژول‌های product قرار دارد.

=========================================================
*/

"use client";

import { useEffect, useState } from "react";

import ProductDetails from "@/components/ProductDetails";
import catalogService from "@/services/catalog.service";

export default function Product() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const data = await catalogService.getProduct("ethiopian");

        if (!isMounted) {
          return;
        }

        setProduct(data);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ProductDetails
      product={product}
      loading={loading}
      error={error}
    />
  );
}