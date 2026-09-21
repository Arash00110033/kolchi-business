export default function Preview({ theme, storeName, slogan, page, device, activeHighlight }) {
  const width =
    device === "mobile"
      ? "390px"
      : device === "tablet"
      ? "760px"
      : "100%";

  const cardStyle = theme.components?.cardStyle || "soft";
  const buttonStyle = theme.components?.buttonStyle || "solid";

  const cardClass =
    cardStyle === "flat"
      ? "border-transparent shadow-none"
      : cardStyle === "bordered"
      ? "border border-[var(--theme-border)] shadow-none"
      : "border border-[var(--theme-border)] shadow-md";

  const buttonClass =
    buttonStyle === "outline"
      ? "border-2 border-[var(--theme-primary)] bg-transparent text-[var(--theme-primary)]"
      : "bg-[var(--theme-primary)] text-white";

  const Product = ({ name, price }) => (
    <div
      className={`relative overflow-hidden ${cardClass}`}
      style={{
        borderRadius: theme.shape.radius,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        outline:
          activeHighlight === "cardStyle" || activeHighlight === "radius"
            ? `3px solid ${theme.colors.primary}`
            : undefined,
        outlineOffset:
          activeHighlight === "cardStyle" || activeHighlight === "radius"
            ? "3px"
            : undefined,
        boxShadow:
          activeHighlight === "cardStyle" || activeHighlight === "radius"
            ? `0 0 0 7px ${theme.colors.primary}22`
            : undefined,
      }}
    >
      {(activeHighlight === "cardStyle" || activeHighlight === "radius") && (
        <span
          className="absolute right-3 top-3 z-20 rounded-full px-2 py-1 text-[10px] font-black shadow-md"
          style={{
            backgroundColor: theme.colors.primary,
            color: "#fff",
          }}
        >
          ?? {activeHighlight === "cardStyle" ? "سبک کارت" : "Radius"}
        </span>
      )}

      <div
        className="h-32"
        style={{ backgroundColor: `${theme.colors.primary}18` }}
      />

      <div className="p-4">
        <div className="font-bold">{name}</div>

        <div
          className="mt-2 text-sm"
          style={{ color: theme.colors.muted }}
        >
          {price}
        </div>

        <button
          type="button"
          className={`mt-4 w-full rounded-[var(--theme-radius-small)] px-3 py-2 text-sm font-bold transition ${buttonClass}`}
          style={{
            backgroundColor:
              buttonStyle === "outline"
                ? "transparent"
                : theme.colors.primary,
            color:
              buttonStyle === "outline"
                ? theme.colors.primary
                : "#fff",
            borderColor: theme.colors.primary,
          }}
        >
          افزودن به سبد
        </button>
      </div>
    </div>
  );

  const previewStyle = {
    "--theme-primary": theme.colors.primary,
    "--theme-primary-hover": theme.colors.primaryHover,
    "--theme-secondary": theme.colors.secondary,
    "--theme-background": theme.colors.background,
    "--theme-surface": theme.colors.surface,
    "--theme-surface-muted": theme.colors.surfaceMuted,
    "--theme-foreground": theme.colors.foreground,
    "--theme-border": theme.colors.border,
    "--theme-muted": theme.colors.muted,
    "--theme-radius": theme.shape.radius,
    "--theme-radius-small": theme.shape.radiusSmall,
    "--theme-radius-large": theme.shape.radiusLarge,
    "--theme-max-width": theme.layout?.maxWidth || "1540px",
  };

  const previewButtonStyle = (keys = []) => ({
    backgroundColor:
      buttonStyle === "outline"
        ? "transparent"
        : theme.colors.primary,
    color:
      buttonStyle === "outline"
        ? theme.colors.primary
        : "#ffffff",
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.shape.radiusSmall,
    ...(keys.includes(activeHighlight)
      ? {
          outline: `3px solid ${theme.colors.secondary}`,
          outlineOffset: "4px",
          boxShadow: `0 0 0 8px ${theme.colors.secondary}26`,
        }
      : {}),
  });

  return (
    <div
      className="flex min-h-[680px] justify-center p-3"
      style={{ backgroundColor: "#e5e7eb" }}
    >
      <div
        className="min-h-[640px] overflow-hidden border shadow-xl transition-all"
        style={{
          ...previewStyle,
          width,
          maxWidth: "100%",
          borderRadius: theme.shape.radiusLarge,
          backgroundColor: theme.colors.background,
          color: theme.colors.foreground,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {/* HEADER */}
        <div
          className="border-b px-5 py-4"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-black">{storeName}</div>
              <div
                className="text-xs"
                style={{ color: theme.colors.muted }}
              >
                {slogan}
              </div>
            </div>

            <div
              className="hidden gap-4 text-sm md:flex"
              style={{ color: theme.colors.muted }}
            >
              <span>خانه</span>
              <span>محصولات</span>
              <span>دسته‌بندي</span>
              <span>سبد ??</span>
            </div>
          </div>
        </div>

        {/* HOME */}
        {page === "home" && (
          <div className="p-5">
            <div
              className="p-8 text-white"
              style={{
                backgroundColor: theme.colors.hero,
                borderRadius: theme.shape.radiusLarge,
              }}
            >
              <div className="mb-2 text-xs opacity-75">
                فروشگاه شما • Preview
              </div>

              <h1 className="text-3xl font-black">
                تجربه‌اي که مشتري يادش مي‌ماند
              </h1>

              <p className="mt-3 max-w-xl text-sm opacity-85">
                اين بخش با رنگ «بخش شعار» کنترل مي‌شود.
              </p>

              <button
                type="button"
                className="mt-6 px-5 py-3 font-bold transition"
                style={previewButtonStyle(["primary", "buttonStyle"])}
              >
                مشاهده محصولات
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Product name="محصول اول" price="?,???,??? تومان" />
              <Product name="محصول دوم" price="???,??? تومان" />
              <Product name="محصول سوم" price="?,???,??? تومان" />
            </div>

            <div
              className="mt-6 rounded-[var(--theme-radius)] p-5 text-center"
              style={{
                backgroundColor: theme.colors.surfaceMuted,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div className="font-bold">يک بخش محتوايي نمونه</div>
              <div
                className="mt-2 text-sm"
                style={{ color: theme.colors.muted }}
              >
                براي نمايش تفاوت Surface و Surface Muted
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT */}
        {page === "product" && (
          <div className="grid gap-6 p-5 md:grid-cols-2">
            <div
              className="min-h-80"
              style={{
                backgroundColor: `${theme.colors.primary}18`,
                borderRadius: theme.shape.radiusLarge,
              }}
            />

            <div className="self-center">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${theme.colors.secondary}25`,
                  color: theme.colors.foreground,
                }}
              >
                موجود
              </span>

              <h1 className="mt-4 text-3xl font-black">
                نام محصول نمونه
              </h1>

              <p
                className="mt-3 text-sm"
                style={{ color: theme.colors.muted }}
              >
                توضيحات محصول، ويژگي‌ها و اطلاعات مورد نياز مشتري.
              </p>

              <div className="mt-5 text-2xl font-black">
                ?,???,??? تومان
              </div>

              <button
                type="button"
                className="mt-6 w-full px-5 py-3 font-bold transition"
                style={previewButtonStyle(["primary", "buttonStyle"])}
              >
                افزودن به سبد خريد
              </button>
            </div>
          </div>
        )}

        {/* CART */}
        {page === "cart" && (
          <div className="mx-auto max-w-3xl p-5">
            <h1 className="text-2xl font-black">سبد خريد</h1>

            <div
              className={`mt-5 p-5 ${cardClass}`}
              style={{
                borderRadius: theme.shape.radius,
                backgroundColor: theme.colors.surface,
              }}
            >
              <div
                className="flex items-center justify-between pb-4"
                style={{
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <span className="font-bold">محصول نمونه</span>
                <span>?,???,??? تومان</span>
              </div>

              <div className="mt-5 flex items-center justify-between font-black">
                <span>مجموع</span>
                <span>?,???,??? تومان</span>
              </div>

              <button
                type="button"
                className="mt-5 w-full px-5 py-3 font-bold transition"
                style={previewButtonStyle(["primary", "buttonStyle"])}
              >
                ادامه پرداخت
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div
          className="mt-5 border-t px-5 py-5 text-center text-xs"
          style={{
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
            color: theme.colors.muted,
          }}
        >
          {storeName} • همه حقوق محفوظ است
        </div>
      </div>
    </div>
  );
}
