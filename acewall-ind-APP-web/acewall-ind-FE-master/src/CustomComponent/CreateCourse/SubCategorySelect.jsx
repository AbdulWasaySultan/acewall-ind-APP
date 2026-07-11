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

const SubCategorySelect = ({ register, errors, selectedCategory }) => {
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const getSubcategories = async () => {
      try {
        const res = await axiosInstance.get("subcategory/get");
        // Ensure we are accessing the correct array from the response
        const data = res.data.subcategories || res.data; 
        setSubcategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      }
    };
    getSubcategories();
  }, []);

  // Filter: compares the category ID from the subcategory to the selectedCategory ID
  // Using .toString() or simple comparison depending on how your state is passed
  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category === selectedCategory || sub.category?._id === selectedCategory
  );

  return (
    <div>
      <Label htmlFor="subcategory" className="block mb-2">
        SubTopics
      </Label>
      <Select
        // Connect to React Hook Form via manual change handler
        onValueChange={(value) => {
          register("subcategory").onChange({
            target: { name: "subcategory", value },
          });
        }}
        disabled={!selectedCategory || filteredSubcategories.length === 0}
      >
        <SelectTrigger className="bg-gray-50">
          <SelectValue placeholder={selectedCategory ? "Select SubTopic" : "Select a category first"} />
        </SelectTrigger>
        <SelectContent>
          {filteredSubcategories.map((sub) => (
            <SelectItem key={sub._id} value={sub._id}>
              {/* Only rendering the title string, ignoring the image object */}
              {sub.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Errors display */}
      {errors?.subcategory && (
        <p className="text-xs text-red-500 mt-1">
          {errors.subcategory.message}
        </p>
      )}
    </div>
  );
};

export default SubCategorySelect;