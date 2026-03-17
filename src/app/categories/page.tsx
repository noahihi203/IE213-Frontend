"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { categoryService } from "@/lib/api/category.service";
import { Category } from "@/lib/types";
import { FolderOpen } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      console.log("response:::", response.metadata);
      setCategories(Array.isArray(response.metadata) ? response.metadata : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Categories</h1>
          <p className="text-gray-600">Browse posts by category</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No categories found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {category.icon ? (
                    <img className="text-4xl" src={category.icon}></img>
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-primary-600" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
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
