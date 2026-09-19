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
                title="ÑäåÇ"
                description="åÑ Ñä ÏÞíÞÇð í˜ ˜ÇÑÈÑÏ ãÔÎÕ ÏÇÑÏ. ÊÛííÑ ÑÇ åãÒãÇä ÏÑ Preview ÈÈíä."
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
                title="ÑÏí æÔååÇ"
                description="åÑå ÈíÔÊÑ ÈÇÔÏ¡ ÙÇåÑ äÑãÊÑ æ ÏæÓÊÇäåÊÑ ãíÔæÏ."
              >
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["8px", "Sharp", "ÊíÒ æ ÑÓãí"],
                    ["14px", "Modern", "ãÏÑä"],
                    ["20px", "Soft", "äÑã"],
                    ["28px", "Round", "ÑÏ æ ÏæÓÊÇäå"],
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
                title="˜ÇÑÊ ãÍÕæá"
                description="äÍæå äãÇíÔ ÞÇÈ æ ÓÇíå ãÍÕæáÇÊ."
              >
                <div className="space-y-2">
                  <Choice
                    title="Soft"
                    description="ÓÇíå äÑã æ ÙÇåÑ ÝÑæÔÇåí"
                    active={theme.components.cardStyle === "soft"}
                    onClick={() => changeComponent("cardStyle", "soft")}
                  />
                  <Choice
                    title="Flat"
                    description="ÈÏæä ÓÇíå¡ ÓÈ˜ æ ãíäíãÇá"
                    active={theme.components.cardStyle === "flat"}
                    onClick={() => changeComponent("cardStyle", "flat")}
                  />
                  <Choice
                    title="Bordered"
                    description="ÍÇÔíå ãÔÎÕ æ ÑÓãí"
                    active={theme.components.cardStyle === "bordered"}
                    onClick={() =>
                      changeComponent("cardStyle", "bordered")
                    }
                  />
                </div>
              </Section>

              <Section
                title="Ï˜ãååÇ"
                description="ÙÇåÑ Ï˜ãååÇí ÇÕáí ãËá ÇÝÒæÏä Èå ÓÈÏ æ ÑÏÇÎÊ."
              >
                <div className="space-y-2">
                  <Choice
                    title="Solid"
                    description="ÑÑä æ æÇÖÍ"
                    active={theme.components.buttonStyle === "solid"}
                    onClick={() => {
                      changeComponent("buttonStyle", "solid");
                      showHighlight("buttonStyle");
                    }}
                  />
                  <Choice
                    title="Outline"
                    description="ÓÈ˜ÊÑ æ ãíäíãÇá"
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
