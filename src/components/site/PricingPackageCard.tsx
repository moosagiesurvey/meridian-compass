import type { PricingPackage } from "../../lib/pricing";

export function PricingPackageCard({ pkg }: { pkg: PricingPackage }) {
  return (
    <div className="h-full border border-white/10 bg-[#0c1a30] p-6 text-left">
      {pkg.bonus ? (
        <div className="mb-3 text-[0.65rem] tracking-[0.15em] text-gold">GROWTH BONUS INCLUDED</div>
      ) : null}
      <h3 className="font-serif text-2xl text-ivory">{pkg.name}</h3>
      <p className="mt-4 font-serif text-2xl text-gold">{pkg.price}</p>
      <p className="mt-1 min-h-10 text-sm text-ivory/60">{pkg.sub}</p>
      <ul className="mt-6 space-y-2 text-sm font-light text-ivory/70">
        {pkg.items.map((item) => (
          <li key={item}>— {item}</li>
        ))}
      </ul>
      {pkg.bonus ? (
        <p className="mt-5 text-xs text-gold-soft/80">Bonus: R75 per tracked lead above baseline*</p>
      ) : null}
      <p className="mt-6 text-xs leading-relaxed text-ivory/55">Best for: {pkg.best}</p>
    </div>
  );
}
