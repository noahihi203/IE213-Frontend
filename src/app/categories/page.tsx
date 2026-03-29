"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { categoryService } from "@/lib/api/category.service";
import { Category } from "@/lib/types";
import { FolderOpen } from "@phosphor-icons/react";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${montserrat.className} min-h-[100dvh] bg-slate-50`}>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tighter text-slate-950 md:text-5xl">
            Categories
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Explore writing by topic and quickly jump to the category that fits
            your interest.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((slot) => (
              <div
                key={slot}
                className="rounded-[1.25rem] border border-slate-200 bg-white p-6"
              >
                <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
            <FolderOpen
              size={56}
              className="mx-auto mb-4 text-slate-300"
              weight="duotone"
            />
            <p className="text-lg font-medium text-slate-800">
              No categories found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="rounded-[1.25rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_40px_-18px_rgba(15,23,42,0.12)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] hover:shadow-[0_24px_44px_-18px_rgba(15,23,42,0.14)]"
              >
                <div className="flex items-start gap-4">
                  {category.icon ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        className="h-full w-full object-cover"
                        src={category.icon}
                        alt={category.name}
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <FolderOpen size={22} weight="duotone" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate text-lg font-semibold tracking-tight text-slate-900 transition-colors hover:text-emerald-700">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="truncate text-sm text-slate-600">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
