export default function StoreSettings({
  Section,
  Choice,
  storeName,
  setStoreName,
  slogan,
  setSlogan,
  theme,
  changeWidth,
  changeTypography,
}) {
  return (
    <>
<>
              <Section
                title="اطلاعات فروشگاه"
                description="نام و شعار در Header فروشگاه Preview نمایش داده می‌شوند."
              >
                <label className="block text-sm font-bold">
                  نام فروشگاه
                </label>

                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-2 w-full rounded-xl border bg-transparent px-3 py-2 outline-none"
                  maxLength={80}
                />

                <label className="mt-4 block text-sm font-bold">
                  شعار فروشگاه
                </label>

                <input
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="mt-2 w-full rounded-xl border bg-transparent px-3 py-2 outline-none"
                  maxLength={120}
                />
              </Section>

              <Section
                title="عرض محتوا"
                description="مشخص می‌کند فروشگاه روی نمایشگرهای بزرگ چقدر کشیده شود."
              >
                <div className="space-y-2">
                  {[
                    ["1180px", "Compact", "جمع‌وجور"],
                    ["1340px", "Balanced", "متعادل"],
                    ["1540px", "Wide", "پهن و مدرن"],
                  ].map(([value, title, desc]) => (
                    <Choice
                      key={value}
                      title={title}
                      description={desc}
                      active={theme.layout.maxWidth === value}
                      onClick={() => changeWidth(value)}
                    />
                  ))}
                </div>
              </Section>

              <Section
                title="فونت"
                description="فونت تمام Preview را کنترل می‌کند."
              >
                <select
                  value={theme.typography.fontFamily}
                  onChange={(e) => changeTypography(e.target.value)}
                  className="w-full rounded-xl border bg-transparent px-3 py-3"
                >
                  <option value="Arial, Helvetica, sans-serif">
                    Arial
                  </option>
                  <option value="Tahoma, Arial, sans-serif">
                    Tahoma
                  </option>
                  <option value="Verdana, Arial, sans-serif">
                    Verdana
                  </option>
                  <option value="Georgia, serif">
                    Georgia
                  </option>
                </select>
              </Section>
            </>
    </>
  );
}
