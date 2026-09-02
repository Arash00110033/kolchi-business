/*
=========================================================
DYNAMIC PRODUCT PAGE
=========================================================

Responsibility:
- Read product slug from the URL
- Request the product from the catalog service
- Manage loading and error states
- Pass the result to ProductDetails

Example:
    /product/ethiopian

API:
    GET /api/v1/products/ethiopian/

This page is responsible only for Page-level data loading.
The actual product UI remains inside ProductDetails
and its modular child components.

=========================================================
*/

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import ProductDetails from "@/components/ProductDetails";
import catalogService from "@/services/catalog.service";

export default function ProductBySlug() {
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { slug } = router.query;

    if (!slug || typeof slug !== "string") {
      return;
    }

    let isMounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const data = await catalogService.getProduct(slug);

        if (!isMounted) {
          return;
        }

        setProduct(data);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err);
        setProduct(null);
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
  }, [router.isReady, router.query.slug]);

  return (
    <ProductDetails
      product={product}
      loading={loading}
      error={error}
    />
  );
}