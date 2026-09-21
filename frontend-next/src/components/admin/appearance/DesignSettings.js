export default function DesignSettings({
  Section,
  Choice,
  COLOR_FIELDS,
  theme,
  changeColor,
  changeShape,
  changeComponent,
  showHighlight,
}) {
  return (
    <>
<>
              <Section
                title="رنگ‌ها"
                description="هر رنگ دقيقاً يک کاربرد مشخص دارد. تغيير را هم‌زمان در Preview ببين."
              >
                <div className="space-y-4">
                  {COLOR_FIELDS.map(([key, title, description]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold">
                            {title}
                          </div>
                          <div className="text-[10px] leading-5 text-[var(--theme-muted)]">
                            {description}
                          </div>
                        </div>

                        <input
                          type="color"
                          value={theme.colors[key]}
                          onFocus={() => showHighlight(key)}
                          onChange={(e) =>
                            changeColor(key, e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded-lg border p-0"
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-lg border"
                          style={{
                            backgroundColor: theme.colors[key],
                          }}
                        />

                        <input
                          value={theme.colors[key]}
                          onChange={(e) =>
                            changeColor(key, e.target.value)
                          }
                          className="w-full rounded-lg border bg-transparent px-3 py-2 font-mono text-xs uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section
                title="گردي گوشه‌ها"
                description="هرچه بيشتر باشد، ظاهر نرم‌تر و دوستانه‌تر مي‌شود."
              >
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["8px", "Sharp", "تيز و رسمي"],
                    ["14px", "Modern", "مدرن"],
                    ["20px", "Soft", "نرم"],
                    ["28px", "Round", "گرد و دوستانه"],
                  ].map(([value, title, desc]) => (
                    <Choice
                      key={value}
                      title={title}
                      description={desc}
                      active={theme.shape.radius === value}
                      onClick={() => changeShape("radius", value)}
                    >
                      <div
                        className="mt-3 h-8 border-2 border-[var(--theme-primary)]"
                        style={{ borderRadius: value }}
                      />
                    </Choice>
                  ))}
                </div>
              </Section>

              <Section
                title="کارت محصول"
                description="نحوه نمايش قاب و سايه محصولات."
              >
                <div className="space-y-2">
                  <Choice
                    title="Soft"
                    description="سايه نرم و ظاهر فروشگاهي"
                    active={theme.components.cardStyle === "soft"}
                    onClick={() => changeComponent("cardStyle", "soft")}
                  />
                  <Choice
                    title="Flat"
                    description="بدون سايه، سبک و مينيمال"
                    active={theme.components.cardStyle === "flat"}
                    onClick={() => changeComponent("cardStyle", "flat")}
                  />
                  <Choice
                    title="Bordered"
                    description="حاشيه مشخص و رسمي"
                    active={theme.components.cardStyle === "bordered"}
                    onClick={() =>
                      changeComponent("cardStyle", "bordered")
                    }
                  />
                </div>
              </Section>

              <Section
                title="دکمه‌ها"
                description="ظاهر دکمه‌هاي اصلي مثل افزودن به سبد و پرداخت."
              >
                <div className="space-y-2">
                  <Choice
                    title="Solid"
                    description="پررنگ و واضح"
                    active={theme.components.buttonStyle === "solid"}
                    onClick={() => {
                      changeComponent("buttonStyle", "solid");
                      showHighlight("buttonStyle");
                    }}
                  />
                  <Choice
                    title="Outline"
                    description="سبک‌تر و مينيمال"
                    active={theme.components.buttonStyle === "outline"}
                    onClick={() => {
                      changeComponent("buttonStyle", "outline");
                      showHighlight("buttonStyle");
                    }}
                  />
                </div>
              </Section>
            </>
    </>
  );
}
