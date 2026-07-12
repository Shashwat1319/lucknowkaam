import Link from "next/link";
import { CATEGORIES } from "@/types";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="card p-4 flex flex-col items-center text-center hover:border-primary/50 hover:bg-orange-50/30 transition-all duration-200 group"
        >
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
          <h3 className="text-sm font-semibold text-text-primary">{cat.name_hindi}</h3>
        </Link>
      ))}
    </div>
  );
}
