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
              title="قالب‌هاي آماده"
              description="قالب فقط يک نقطه شروع است؛ بعد از انتخاب مي‌تواني همه جزئياتش را تغيير بدهي."
            >
              <div className="space-y-2">
                {Object.entries(PRESETS).map(([id, preset]) => (
                  <Choice
                    key={id}
                    title={preset.meta?.title || id}
                    description={preset.meta?.description || ""}
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
                  description="تنظيمات دستي فعلي شما"
                  active={presetName === "custom"}
                  onClick={() => setPresetName("custom")}
                />
              </div>
            </Section>
  );
}
