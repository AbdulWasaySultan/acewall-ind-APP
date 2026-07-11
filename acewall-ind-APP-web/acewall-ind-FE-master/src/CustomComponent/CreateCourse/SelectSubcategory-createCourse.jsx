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

const SubCategorySelect_createCourse = ({ register, errors, selectedCategory }) => {
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const getSubcategories = async () => {
      try {
        const res = await axiosInstance.get("subcategory/get");
        setSubcategories(res.data.subcategories);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      }
    };
    getSubcategories();
  }, []);

  // Filter subcategories based on selected category
  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category === selectedCategory
  );

  return (
    <div>
      <Label htmlFor="subcategory" className="block mb-2">
        Sub Category
      </Label>
      <Select
        onValueChange={(value) => {
          const event = { target: { name: "subcategory", value } };
          register("subcategory").onChange(event);
        }}
        disabled={!selectedCategory}
      >
        <SelectTrigger className="bg-gray-50">
          <SelectValue placeholder="Select sub category" />
        </SelectTrigger>
        <SelectContent>
          {filteredSubcategories.map((value) => (
            <SelectItem key={value._id} value={value._id}>
              {value.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" {...register("subcategory")} />
      {errors?.subcategory && (
        <p className="text-xs text-red-500 mt-1">
          {errors.subcategory.message}
        </p>
      )}
    </div>
  );
};

export default SubCategorySelect_createCourse;