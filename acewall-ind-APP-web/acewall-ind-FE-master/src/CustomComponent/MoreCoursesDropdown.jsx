import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "@/Context/GlobalProvider";

const MoreCoursesDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const navigate = useNavigate();
  const { setSelectedSubcategoryId } = useContext(GlobalContext);

  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const categoryRes = await axiosInstance.get("/category/get");
        const allCategories = categoryRes.data?.categories || [];

        const validCategories = [];
        const subcategoryMap = {};

        // Use Promise.allSettled to handle errors gracefully
        const subcategoryPromises = allCategories.map(async (category) => {
          if (!category._id) return;

          try {
            const subRes = await axiosInstance.get(`/category/subcategories/${category._id}`);
            const subcategories = subRes.data?.subcategories || [];

            if (subcategories.length > 0) {
              validCategories.push(category);
              subcategoryMap[category._id] = subcategories;
            }
          } catch (err) {
            console.error(`❌ Failed to load subcategories for ${category.title}:`, err.message);
          }
        });

        await Promise.allSettled(subcategoryPromises);

        setCategories(validCategories);
        setSubCategoriesMap(subcategoryMap);
      } catch (error) {
        console.error("❌ Error fetching categories:", error.message);
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);

  const handleNavigate = (subcategoryId) => {
    setSelectedSubcategoryId(subcategoryId);
    navigate(`/student/courses/${subcategoryId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="text-xs md:text-md lg:text-base font-medium text-gray-700 flex items-center gap-3"
        >
          MORE COURSES
          <ChevronDown className="w-4 h-4 transition-transform duration-300" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
        {categories.length > 0 ? (
          categories.map((category) => (
            <DropdownMenuSub key={category._id}>
              <DropdownMenuSubTrigger>{category.title}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {subCategoriesMap[category._id].map((sub) => (
                  <DropdownMenuItem
                    key={sub._id}
                    className="cursor-pointer"
                    onSelect={() => handleNavigate(sub._id)}
                  >
                    {sub.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))
        ) : (
          <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreCoursesDropdown;
