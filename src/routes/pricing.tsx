import { createFileRoute, Link } from "@tanstack/react-router";
import { PricingPackageCard } from "../components/site/PricingPackageCard";
import { Reveal } from "../components/site/Reveal";
import { VISIBILITY_PACKAGES, WEBSITE_PACKAGES } from "../lib/pricing";
import { buildBreadcrumbJsonLd, SITE_URL } from "../lib/site-content";

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing" },
]);

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Website Design & SEO Pricing | Meridian Digital" },
      {
        name: "description",
        content:
          "Clear website design, SEO and AI visibility pricing for South African businesses. Choose a package that fits where you are today.",
      },
      { property: "og:title", content: "Packages & Pricing | Meridian Digital" },
      {
        property: "og:description",
        content: "Website design, SEO and AI visibility packages with clear monthly retainers.",
      },
      { property: "og:url", content: `${SITE_URL}/pricing` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/pricing` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) }],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <>
      <section className="px-6 pb-16 pt-32 text-center md:pb-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="label-eyebrow mb-5">Packages & Pricing</div>
            <h1 className="font-serif text-4xl leading-tight text-ivory md:text-6xl">
              Invest in being <span className="italic text-gold-soft">found and chosen.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base font-light leading-relaxed text-ivory/70 md:text-[1.05rem]">
              Pick the starting point that matches your business today. Every package is built around
              clear work, clear reporting and a direct line to the people doing it.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#0c1a30]/70 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center">
              <div className="label-eyebrow mb-4">Website + Visibility</div>
              <h2 className="font-serif text-3xl text-ivory md:text-4xl">Start with the right foundation.</h2>
              <p className="mx-auto mt-4 max-w-2xl font-light leading-relaxed text-ivory/65">
                For a new website or one that needs replacing. Every tier includes a custom build;
                the difference is the visibility support that follows launch.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {WEBSITE_PACKAGES.map((pkg, index) => (
              <Reveal key={pkg.name} delay={index * 0.08}>
                <PricingPackageCard pkg={pkg} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="border border-gold/30 bg-[#11203A] p-7 text-center md:p-10">
              <div className="label-eyebrow mb-3">Existing Website?</div>
              <h2 className="font-serif text-3xl text-ivory">Visibility Audit — R1,500 once-off</h2>
              <p className="mx-auto mt-4 max-w-2xl font-light leading-relaxed text-ivory/70">
                We check your technical health, local search presence and AI visibility before we
                recommend a plan. If you proceed, the audit is credited toward your first month.
              </p>
              <Link to="/contact" className="btn-gold btn-gold-hover mt-7">
                Book a Visibility Audit
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0c1a30]/70 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <div className="label-eyebrow mb-4">SEO + AI Visibility</div>
              <h2 className="font-serif text-3xl text-ivory md:text-4xl">Grow what you already have.</h2>
              <p className="mx-auto mt-4 max-w-2xl font-light leading-relaxed text-ivory/65">
                For existing sites that need to show up more consistently in Google, Maps and AI
                search results.
              </p>
            </div>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
            {VISIBILITY_PACKAGES.map((pkg, index) => (
              <Reveal key={pkg.name} delay={index * 0.08}>
                <PricingPackageCard pkg={pkg} />
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-muted">
            *Growth bonus is R75 per tracked lead above the agreed monthly baseline, capped monthly.
          </p>
          <Reveal delay={0.18}>
            <div className="mt-10 text-center">
              <Link to="/contact" className="btn-gold btn-gold-hover">
                Talk Through Your Package
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
