import BackToStoreButton from "../../common/BackToStoreButton";

export default function OwnerHero({ t }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#171513] p-7 text-white shadow-[0_24px_70px_rgba(23,21,19,0.18)] sm:p-9">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#c9a66b]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a66b]/25 bg-[#c9a66b]/10 px-3.5 py-1.5 text-xs font-black tracking-wide text-[#e5c98f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a66b]" />
            Owner
          </div>

          <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
            {t("adminOwner.title")}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            {t("adminOwner.subtitle")}
          </p>
        </div>

        <BackToStoreButton
          t={t}
          translationKey="adminDashboard.backToStore"
          dark
        />
      </div>
    </section>
  );
}


