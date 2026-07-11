import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/AxiosInstance";
import React, { useEffect, useState } from "react";

const SelectCategory_createCourse = ({ register, errors, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategoriesWithSubcategories = async () => {
      try {
        const categoryRes = await axiosInstance.get("/category/get");
        const allCategories = categoryRes.data?.categories || [];

        const validCategories = [];

        const subcategoryFetches = allCategories.map(async (category) => {
          if (!category._id) return;

          try {
            const subRes = await axiosInstance.get(`/category/subcategories/${category._id}`);
            const subcategories = subRes.data?.subcategories || [];

            if (subcategories.length > 0) {
              validCategories.push(category);
            }
          } catch (err) {
            console.error(`Failed to fetch subcategories for ${category.title}:`, err.message);
          }
        });

        await Promise.allSettled(subcategoryFetches);
        setCategories(validCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err.message);
      }
    };

    fetchCategoriesWithSubcategories();
  }, []);

  return (
    <div>
      <Label htmlFor="category" className="block mb-2">
        Category
      </Label>
      <Select
        onValueChange={(value) => {
          const event = { target: { name: "category", value } };
          register("category").onChange(event);
          onCategoryChange?.(value);
        }}
      >
        <SelectTrigger className="bg-gray-50">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.length > 0 ? (
            categories.map((value) => (
              <SelectItem key={value._id} value={value._id}>
                {value.title}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500">No categories with subcategories</div>
          )}
        </SelectContent>
      </Select>
      <input type="hidden" {...register("category")} />
      {errors?.category && (
        <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
      )}
    </div>
  );
};

export default SelectCategory_createCourse;