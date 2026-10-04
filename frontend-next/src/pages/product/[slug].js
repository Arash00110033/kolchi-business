/*
=========================================================
DYNAMIC PRODUCT PAGE
=========================================================

Responsibility:
- Read product slug from the URL
- Read active store from StoreContext
- Request the product from the store-scoped catalog service
- Manage loading and error states
- Pass the result to ProductDetails

API:
    GET /api/v1/stores/{store_id}/products/{slug}/

The actual product UI remains inside ProductDetails.
=========================================================
*/

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import ProductDetails from "@/components/ProductDetails";
import catalogService from "@/services/catalog.service";
import { useStore } from "@/context/StoreContext";

export default function ProductBySlug() {
  const router = useRouter();
  const { storeId, storeConfigLoading } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!router.isReady || storeConfigLoading) {
      return;
    }

    const { slug } = router.query;

    if (!slug || typeof slug !== "string" || !storeId) {
      return;
    }

    let isMounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const data = await catalogService.getProduct(storeId, slug);

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
  }, [
    router.isReady,
    router.query.slug,
    storeId,
    storeConfigLoading,
  ]);

  return (
    <ProductDetails
      product={product}
      loading={loading}
      error={error}
    />
  );
}