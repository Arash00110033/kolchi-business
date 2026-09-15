import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useI18n } from "@/i18n";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductLoading from "@/components/product/ProductLoading";

import authService from "@/services/auth.service";
import cartService from "@/services/cart.service";

function normalizeProduct(product) {
  if (!product) return null;

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
    available: Boolean(product.is_active) && stock > 0,
    images,
  };
}

function ProductError({ error }) {
  const { t, isRTL } = useI18n();

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--theme-background)] px-4 py-10 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-[var(--theme-foreground)]">
            {t("common.errorTitle")}
          </h1>

          <p className="mt-3 text-sm text-[var(--theme-muted)]">
            {error?.message ||
              t("common.error")}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetails({
  product = null,
  loading = false,
  error = null,
}) {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const normalizedProduct = normalizeProduct(product);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setCartMessage("");
    setCartError("");
    setRequiresLogin(false);
  }, [normalizedProduct?.id]);

  const increaseQuantity = () => {
    setQuantity((current) => {
      const stock = Number(normalizedProduct?.stock || 0);

      if (stock <= 0) return 1;

      return Math.min(current + 1, stock);
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = async () => {
    if (!normalizedProduct?.available || addingToCart) {
      return;
    }

    const token = authService.getStoredAccessToken();

    if (!token) {
      setCartError(
        t("common.loginRequired")
      );
      setCartMessage("");
      return;
    }

    try {
      setAddingToCart(true);
      setCartMessage("");
      setCartError("");

      await cartService.addItem(
        token,
        normalizedProduct.id,
        quantity
      );

      setCartMessage(
        t("common.addedToCart")
      );
    } catch (err) {
      setCartError(
        err?.data?.detail ||
          t("common.addToCartFailed")
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <ProductLoading />;
  }

  if (error) {
    return <ProductError error={error} />;
  }

  if (!normalizedProduct) {
    return <ProductLoading />;
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--theme-background)] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--theme-border)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--theme-foreground)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span
              aria-hidden="true"
              className="text-lg transition-transform group-hover:-translate-x-0.5"
            >
              ←
            </span>
            <span>{t("common.back")}</span>
          </button>

          {normalizedProduct.category_name && (
            <span className="rounded-full border border-[var(--theme-border)] bg-white px-4 py-2 text-xs font-bold text-[var(--theme-muted)] shadow-sm">
              {normalizedProduct.category_name}
            </span>
          )}
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[var(--theme-border)] bg-white shadow-[0_15px_50px_rgba(70,45,30,0.06)]">
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
              onAddToCart={handleAddToCart}
              addingToCart={addingToCart}
              cartMessage={cartMessage}
              cartError={cartError}
              requiresLogin={requiresLogin}
            />
          </div>
        </section>
      </div>
    </main>
  );
}