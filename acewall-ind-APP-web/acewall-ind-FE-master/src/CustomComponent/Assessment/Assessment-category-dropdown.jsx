import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/AxiosInstance";

export default function CategoryDropdown({
  courseId,
  value,
  onValueChange,
  error,
}) {
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      weight: 0,
    },
  });
  
  // Fetch categories when component mounts or courseId changes
  useEffect(() => {
    if (courseId) {
      fetchCategories();
    }
  }, [courseId]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `assessmentCategory/${courseId}`,
      );

      console.log(response , "response from fetching categories in CategoryDropdown");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch categories");
      }
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = "Category name is required";
    } else if (data.name.length > 50) {
      errors.name = "Name must be less than 50 characters";
    }

    if (!data.weight || data.weight < 0.1) {
      errors.weight = "Weight must be at least 0.1";
    } else if (data.weight > 100) {
      errors.weight = "Weight cannot exceed 100";
    }

    return errors;
  };

  const onSubmit = async (data) => {
    const errors = validateForm(data);

    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach((field) => {
        form.setError(field, { message: errors[field] });
      });
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Creating category...");

    try {
      const response = await axiosInstance.post(
        `assessmentCategory/${courseId}`,
        {
          name: data.name,
          weight: data.weight,
          course: courseId,
        },
      );

      toast.success(response.data.message, { id: toastId });

      const newCategory = response.data.category;
      setCategories((prev) => [...prev, newCategory]);

      onValueChange(newCategory._id);

      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create category",
        { id: toastId },
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new assessment category for this course.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Midterm Exam, Quiz, Assignment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g., 25"
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue
            placeholder={
              isLoading ? "Loading categories..." : "Select a category"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {categories.length === 0 && !isLoading ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No categories found
            </div>
          ) : (
            categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                <div className="flex justify-between items-center w-full">
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {category.weight}%
                  </span>
                </div>
              </SelectItem>
            ))
          )}

          <div className="border-t mt-1 pt-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-sm"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Category
            </Button>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
