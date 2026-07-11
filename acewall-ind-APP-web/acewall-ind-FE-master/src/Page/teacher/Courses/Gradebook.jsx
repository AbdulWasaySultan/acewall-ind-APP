import { useContext, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { Plus, Pencil, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CourseContext } from "@/Context/CoursesProvider";
import BackButton from "@/CustomComponent/BackButton";

// Define the form schema with Zod
const gradebookSchema = z.object({
  gradingMethod: z.enum(["points-based"], {
  }),
  // gradingMethod: z.enum(["points-based", "percentage", "letter-grade"], {
  //   required_error: "Please select a grading method",
  // }),
  minimumPassingGrade: z
    .string()
    .min(1, { message: "Minimum passing grade is required" })
    .refine(
      (val) => {
        // Check if it's a valid percentage (e.g., "60%")
        const percentageRegex = /^[0-9]{1,3}%$/;
        return percentageRegex.test(val);
      },
      { message: "Please enter a valid percentage (e.g., 60%)" }
    ),
  categories: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Category name is required" }),
        weight: z
          .number()
          .min(0, { message: "Weight must be at least 0" })
          .max(100, { message: "Weight cannot exceed 100" }),
      })
    )
    .min(1, { message: "At least one category is required" })
    .refine(
      (categories) => {
        // Check if the total weight adds up to 100%
        const totalWeight = categories.reduce(
          (sum, category) => sum + category.weight,
          0
        );
        return totalWeight === 100;
      },
      { message: "Category weights must add up to 100%" }
    ),
  gradingScale: z
    .array(
      z.object({
        letter: z.string().min(1, { message: "Letter grade is required" }),
        range: z.string().min(1, { message: "Percentage range is required" }),
      })
    )
    .min(1, { message: "At least one grading scale entry is required" }),
});

export default function TeacherGradebook() {
  const navigate = useNavigate();
  const [isEditingScale, setIsEditingScale] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { course, setCourse } =
    useContext(CourseContext);

  useEffect(() => {
    const isEmptyBasics = Object.keys(course.basics).length === 0;
    const isEmptyChapters = course.chapters.length === 0;
    const isEmptyGrades = Object.keys(course.grades).length === 0;

    if (isEmptyBasics && isEmptyChapters) {
      navigate("/teacher/courses/createCourses", { replace: true });
    }
  }, []);

  // Initialize the form with React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(gradebookSchema),
    defaultValues: {
      gradingMethod: "points-based",
      minimumPassingGrade: "60%",
      categories: [
        { name: "Assessment", weight: 40 },
        { name: "Final Project", weight: 40 },
      ],
      gradingScale: [
        { letter: "A", range: "90% - 100%" },
        { letter: "B", range: "80% - 89%" },
        { letter: "C", range: "70% - 79%" },
        { letter: "D", range: "60% - 69%" },
        { letter: "F", range: "Below 60%" },
      ],
    },
  });

  // Set up field arrays for categories and grading scale
  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
    update: updateCategory,
  } = useFieldArray({
    control,
    name: "categories",
  });

  const { fields: scaleFields, update: updateScale } = useFieldArray({
    control,
    name: "gradingScale",
  });

  // Calculate total weight of categories
  const categories = watch("categories");
  const totalWeight = categories.reduce(
    (sum, category) => sum + (category.weight || 0),
    0
  );

  // Handle form submission
  const onSubmit = (grades) => {
    if (grades) {
      setCourse((prev) => ({
        ...prev,
        grades: grades,
      }));
      setIsConfirmationOpen(false);
    }
  };

  console.log(course, "course in grades");

  // Add a new category
  const addNewCategory = () => {
    appendCategory({ name: "", weight: 0 });
  };

  // Edit grading scale item
  const handleEditScale = (index, letter, range) => {
    updateScale(index, { letter, range });
    setIsEditingScale(null);
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg">
      <BackButton className="mb-10" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6 border-b">
          <h2 className="text-2xl font-semibold flex items-center">
            <div className="w-1 h-8 bg-green-500 mr-2"></div>
            Grades
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Grading Method
            </h3>
            <div className="flex items-center">
              <span className=" text-gray-500 mr-4">Percentage Based %</span>
         
            </div>
            {/* <Controller
              name="gradingMethod"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select grading method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points-based">Points-Based</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="letter-grade">Letter Grade</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gradingMethod && (
              <p className="text-xs text-red-500 mt-1">
                {errors.gradingMethod.message}
              </p>
            )} */}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Total Course Points
            </h3>
            <div className="flex items-center">
              <span className="text-lg font-semibold mr-4">70</span>
              <span className="text-gray-500 italic">
                Auto-calculated based on Assessment, quizzes
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Grade Distribution
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Minimum Passing Grade
            </h3>
            <Input
              type="text"
              {...register("minimumPassingGrade")}
              className="bg-gray-50 text-black font-medium border-gray-200"
            />
            {errors.minimumPassingGrade && (
              <p className="text-xs text-red-500 mt-1">
                {errors.minimumPassingGrade.message}
              </p>
            )}
          </div>
        </div>

        <Card className="mb-6 border-gray-200">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-10 bg-gray-50 p-4 border-b border-gray-200">
              <div className=" font-semibold">Category</div>
              <div className=" font-semibold">Weight (%)</div>
            </div>

            {categoryFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-10 p-4 font-semibold border-b border-gray-200"
              >
                <div>
                  <Input
                    {...register(`categories.${index}.name`, {
                      required: "Category name is required",
                    })}
                    placeholder="Category name"
                    className="bg-gray-50 border-gray-200"
                  />
                  {errors.categories?.[index]?.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.categories[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-10  ">
                  <Input
                    type="number"
                    {...register(`categories.${index}.weight`, {
                      valueAsNumber: true,
                      required: "Weight is required",
                      min: { value: 0, message: "Weight must be at least 0" },
                      max: { value: 100, message: "Weight cannot exceed 100" },
                    })}
                    className="w-32 bg-gray-50 border-gray-200"
                  />
                  {categoryFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-red-500"
                      onClick={() => removeCategory(index)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash-2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </Button>
                  )}
                  {errors.categories?.[index]?.weight && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.categories[index]?.weight?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <span className="font-semibold">Total Weight:</span>
              <span
                className={`font-medium ${
                  totalWeight !== 100 ? "text-red-500" : "text-green-500"
                }`}
              >
                {totalWeight}%
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-4"
              onClick={addNewCategory}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Category</span>
            </Button>
          </CardContent>
        </Card>

        {errors.categories && !Array.isArray(errors.categories) && (
          <p className="text-sm text-red-500 mb-4">
            {errors.categories.message}
          </p>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Grading Scale
        </h2>

        <Card className="mb-6 border-gray-200">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 bg-gray-50 p-4 border-b border-gray-200">
              <div className="text-gray-600 font-semibold">Letter Grade</div>
              <div className="text-gray-600 font-semibold">Percentage Range</div>
            </div>

            {scaleFields.map((grade, index) => (
              <div
                key={grade.id}
                className="grid grid-cols-2 p-4 border-b border-gray-200"
              >
                <div>
                  {isEditingScale === index ? (
                    <Input
                      value={grade.letter}
                      onChange={(e) => {
                        const updatedGrade = {
                          ...grade,
                          letter: e.target.value,
                        };
                        updateScale(index, updatedGrade);
                      }}
                      className="w-20 bg-gray-50 border-gray-200"
                    />
                  ) : (
                    grade.letter
                  )}
                </div>
                <div className="flex justify-between items-center">
                  {isEditingScale === index ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={grade.range}
                        onChange={(e) => {
                          const updatedGrade = {
                            ...grade,
                            range: e.target.value,
                          };
                          updateScale(index, updatedGrade);
                        }}
                        className="w-40 bg-gray-50 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingScale(null)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span>{grade.range}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setIsEditingScale(index)}
                      >
                        {/* <Pencil className="h-4 w-4 text-gray-500" /> */}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Link href="/teacher/courses/createCourses/addchapters">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 text-green-500 border-green-500 hover:bg-green-50 hover:text-green-600"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <Dialog
            open={isConfirmationOpen}
            onOpenChange={setIsConfirmationOpen}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                disabled={!isDirty || !isValid || totalWeight !== 100}
              >
                Create Course
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Course Creation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to create this course with the current
                  grading settings?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmationOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleSubmit(onSubmit)()}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  );
}
