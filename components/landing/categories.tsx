import Link from "next/link";
import {
  Building2,
  Landmark,
  FileText,
  Wrench,
  Scissors,
  UtensilsCrossed,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

export function Categories() {
  const categories = [
    {
      name: "Hospitals & Clinics",
      slug: "clinic",
      icon: "🏥",
      lucide: Building2,
      waitRange: "10 – 50 min",
      activeSpots: 42,
    },
    {
      name: "Passport & Visa Centers",
      slug: "passport",
      icon: "🛂",
      lucide: ShieldCheck,
      waitRange: "30 – 90 min",
      activeSpots: 18,
    },
    {
      name: "Government & DMV",
      slug: "government",
      icon: "🏛️",
      lucide: FileText,
      waitRange: "25 – 80 min",
      activeSpots: 29,
    },
    {
      name: "Banks & Forex",
      slug: "bank",
      icon: "🏦",
      lucide: Landmark,
      waitRange: "5 – 25 min",
      activeSpots: 64,
    },
    {
      name: "Device Repair Centers",
      slug: "repair",
      icon: "🔧",
      lucide: Wrench,
      waitRange: "10 – 40 min",
      activeSpots: 31,
    },
    {
      name: "Salons & Grooming",
      slug: "salon",
      icon: "✂️",
      lucide: Scissors,
      waitRange: "5 – 30 min",
      activeSpots: 55,
    },
    {
      name: "Dining & Walk-ins",
      slug: "restaurant",
      icon: "🍽️",
      lucide: UtensilsCrossed,
      waitRange: "15 – 45 min",
      activeSpots: 87,
    },
    {
      name: "University Admin",
      slug: "university",
      icon: "🎓",
      lucide: GraduationCap,
      waitRange: "15 – 60 min",
      activeSpots: 22,
    },
  ];

  return (
    <section className="py-10 sm:py-12 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Everywhere Queues Form
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Operational Categories
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Browse all locations →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className="flex flex-col p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] font-semibold text-emerald-950 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                  {cat.activeSpots} live
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Avg: {cat.waitRange}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
