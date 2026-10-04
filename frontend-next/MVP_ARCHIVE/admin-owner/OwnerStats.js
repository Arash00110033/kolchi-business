export default function OwnerStats({ t, store, members }) {
  const cards = [
    {
      label: t("adminOwner.people"),
      value: members.length,
    },
    {
      label: t("adminOwner.ownerStatus"),
      value: t("adminOwner.ownerOnly"),
    },
    {
      label: t("adminOwner.activeAccess"),
      value: store ? t("adminOwner.enabled") : "—",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-[22px] border border-[#ddd6ca] bg-[#fffdfa] p-5 shadow-[0_12px_35px_rgba(60,45,30,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(60,45,30,0.09)]"
        >
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#c9a66b]/[0.06] blur-2xl transition group-hover:bg-[#c9a66b]/10" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-black uppercase tracking-[0.13em] text-[#958b7d]">
                {card.label}
              </div>
            </div>

            <div className="mt-4 text-2xl font-black tracking-tight text-[#211e1a]">
              {card.value}
            </div>

            <div className="mt-3 h-px w-full bg-[#eee8df]" />
          </div>
        </div>
      ))}
    </section>
  );
}
