export default function PresetSelector({
  Section,
  Choice,
  PRESETS,
  presetName,
  applyPreset,
  setPresetName,
}) {
  return (
<Section
              title="ÞÇáÈåÇí ÂãÇÏå"
              description="ÞÇáÈ ÝÞØ í˜ äÞØå ÔÑæÚ ÇÓÊº ÈÚÏ ÇÒ ÇäÊÎÇÈ ãíÊæÇäí åãå ÌÒÆíÇÊÔ ÑÇ ÊÛííÑ ÈÏåí."
            >
              <div className="space-y-2">
                {Object.entries(PRESETS).map(([id, preset]) => (
                  <Choice
                    key={id}
                    title={preset.title}
                    description={preset.description}
                    active={presetName === id}
                    onClick={() => applyPreset(id)}
                  >
                    <div className="mt-3 flex gap-1">
                      <span
                        className="h-6 flex-1 rounded-md"
                        style={{
                          backgroundColor: preset.colors.primary,
                        }}
                      />
                      <span
                        className="h-6 w-8 rounded-md"
                        style={{
                          backgroundColor: preset.colors.secondary,
                        }}
                      />
                      <span
                        className="h-6 w-8 rounded-md border"
                        style={{
                          backgroundColor: preset.colors.background,
                        }}
                      />
                    </div>
                  </Choice>
                ))}

                <Choice
                  title="Custom"
                  description="ÊäÙíãÇÊ ÏÓÊí ÝÚáí ÔãÇ"
                  active={presetName === "custom"}
                  onClick={() => setPresetName("custom")}
                />
              </div>
            </Section>
  );
}
