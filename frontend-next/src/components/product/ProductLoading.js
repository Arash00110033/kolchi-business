/*
=========================================================
PRODUCT LOADING
=========================================================

Responsibility:
- Display the product-page loading skeleton

This component contains UI only.
No API calls or business logic are performed here.

=========================================================
*/

export default function ProductLoading() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f4ef] px-4 py-10 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="animate-pulse overflow-hidden rounded-[32px] border border-[#e6dfd8] bg-white p-6 shadow-[0_15px_50px_rgba(70,45,30,0.06)] sm:p-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Gallery Skeleton */}

            <div>
              <div className="aspect-square rounded-[26px] bg-[#eee8e2]" />

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="aspect-square rounded-2xl bg-[#eee8e2]" />
                <div className="aspect-square rounded-2xl bg-[#eee8e2]" />
                <div className="aspect-square rounded-2xl bg-[#eee8e2]" />
              </div>
            </div>

            {/* Product Info Skeleton */}

            <div className="space-y-5 py-2">
              {/* Category */}

              <div className="h-8 w-28 rounded-full bg-[#eee8e2]" />

              {/* Title */}

              <div className="h-12 w-3/4 rounded-xl bg-[#eee8e2]" />

              {/* Description */}

              <div className="space-y-3">
                <div className="h-5 w-32 rounded bg-[#eee8e2]" />
                <div className="h-4 w-full rounded bg-[#eee8e2]" />
                <div className="h-4 w-11/12 rounded bg-[#eee8e2]" />
                <div className="h-4 w-4/5 rounded bg-[#eee8e2]" />
              </div>

              {/* Stock */}

              <div className="h-16 w-full rounded-2xl bg-[#eee8e2]" />

              {/* Price */}

              <div className="h-24 w-full rounded-[24px] bg-[#eee8e2]" />

              {/* Quantity + Cart */}

              <div className="flex gap-3">
                <div className="h-14 w-[145px] rounded-2xl bg-[#eee8e2]" />
                <div className="h-14 flex-1 rounded-2xl bg-[#eee8e2]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}