import React, { useContext, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Loader, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { CourseContext } from "@/Context/CoursesProvider";
import CategorySelect from "@/CustomComponent/CreateCourse/CategorySelect";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import SubCategorySelect from "@/CustomComponent/CreateCourse/SubCategorySelect";
import TeachingPointInput from "@/CustomComponent/CreateCourse/TeachingPoints";
import RequirementInput from "@/CustomComponent/CreateCourse/Requirment";
import DateRangePicker from "@/CustomComponent/CreateCourse/DateRangePicker";
import SelectSemAndQuar from "@/CustomComponent/CreateCourse/SelectSemester";
import SelectSemester from "@/CustomComponent/CreateCourse/SelectSemester";
import SelectQuarter from "@/CustomComponent/CreateCourse/SelectQuarter";
import { set } from "lodash";
import ConfirmationModal from "@/CustomComponent/CreateCourse/ConfirmationModal";
import BackButton from "@/CustomComponent/BackButton";
import CourseTypeDropdown from "@/CustomComponent/CreateCourse/CourseTypeDropdown";

// Define the form schema with Zod

const courseFormSchema = z.object({
  courseTitle: z
    .string()
    .min(5, { message: "Course title must be at least 5 characters" })
    .max(100, { message: "Course title must be less than 100 characters" }),
  price: z
  .number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  })
  .min(0, { message: "Price must be a non-negative number" })
  .max(9999, { message: "Price must not exceed 9999" }),

  category: z
    .string({
      required_error: "Please select a category",
    })
    .refine((val) => val !== "", { message: "Please select a category" }),
  subcategory: z
    .string({
      message: "Please select a subcategory",
    })
    .refine((val) => val !== "", { message: "Please select a subcategory" }),
  language: z
    .string()
    .nonempty({ message: "Please select a language" })
    .refine((val) => val !== "", { message: "Please select a language" }),
  courseDescription: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(4000, { message: "Description must be less than 500 characters" }),
  teachingPoints: z
    .array(
      z.object({
        value: z
          .string()
          .min(5, { message: "Teaching point must be at least 5 characters" })
          .max(120, {
            message: "Teaching point must be less than 120 characters",
          }),
      })
    )
    .min(1, { message: "Add at least one teaching point" }),
  requirements: z
    .array(
      z.object({
        value: z
          .string()
          .min(5, { message: "Requirement must be at least 5 characters" })
          .max(120, {
            message: "Requirement must be less than 120 characters",
          }),
      })
    )
    .min(1, { message: "Add at least one requirement" }),
  courseType: z.enum(["normal", "transcript", "certificate"]).default("normal"),
  offersCertificate: z.boolean().default(false),
  offersTranscript: z.boolean().default(false),
  passingPercentage: z.number().min(0).max(100).default(80),
});

export default function EditCourse() {
  const [course, setCourse] = useState();
  const [thumbnailPreview, setThumbnailPreview] = useState(
    course?.thumbnail.url
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  // const { user } = useContext(GlobalContext);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [prevCategory, setPrevCategory] = useState(null);
  const [prevSubCategory, setPrevSubCategory] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      thumbnail: "",
      courseTitle: "",
      price: 0,
      category: "",
      subcategory: "",
      language: "",
      courseDescription: "",
      teachingPoints: [],
      requirements: [],
      courseType: "normal",
      offersCertificate: false,
      offersTranscript: false,
      passingPercentage: 80,
    },
  });
  const watchedLanguage = watch("language");
  const watchedCategory = watch("category");
  const watchedSubCategory = watch("subcategory");

  // console.log(errors, "errors");

  useEffect(() => {
    const fetchCourseBasics = async () => {
      try {
        const response = await axiosInstance.get(
          `course/getCourseBasics/${courseId}`
        );
        const courseData = response.data.course;

        setCourse(courseData);

        reset({
          thumbnail: courseData.thumbnail,
          courseTitle: courseData.courseTitle,
          price: courseData.price,
          category: courseData.category,
          subcategory: courseData.subcategory,
          language: courseData.language,
          courseDescription: courseData.courseDescription,
          teachingPoints:
            courseData.teachingPoints?.map((item) => ({ value: item })) || [],
          requirements:
            courseData.requirements?.map((item) => ({ value: item })) || [],
        });
        setPrevCategory(courseData.category);
        setPrevSubCategory(courseData.subcategory);
        setSelectedCategory(courseData.category);

        let courseType = "normal";
        if (courseData.offersCertificate) courseType = "certificate";
        else if (courseData.offersTranscript) courseType = "transcript";

        setValue("courseType", courseType);
        setValue("offersCertificate", courseData.offersCertificate || false);
        setValue("offersTranscript", courseData.offersTranscript || false);
        setValue("passingPercentage", courseData.passingPercentage || 80);

        setThumbnailPreview(courseData.thumbnail?.url || null);
      } catch (error) {
        console.error("Failed to fetch course basics:", error);
      }
    };
    fetchCourseBasics();
  }, [reset, subcategories, courseId, categories]);

  // Set up field arrays for teaching points and requirements,
  const {
    fields: teachingPointsFields,
    append: appendTeachingPoint,
    remove: removeTeachingPoint,
  } = useFieldArray({
    control,
    name: "teachingPoints",
  });

  const {
    fields: requirementsFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: "requirements",
  });

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG and PNG images are allowed.");
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setValue("thumbnail", file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    console.log(data, "data");

    const formData = new FormData();
    setLoading(true);

    try {
      formData.append("courseTitle", data.courseTitle);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("subcategory", data.subcategory);
      formData.append("language", data.language);
      formData.append("courseDescription", data.courseDescription);
      formData.append(
        "teachingPoints",
        JSON.stringify(data.teachingPoints.map((tp) => tp.value))
      );
      formData.append(
        "requirements",
        JSON.stringify(data.requirements.map((req) => req.value))
      );
      formData.append("offersCertificate", data.offersCertificate);
      formData.append("offersTranscript", data.offersTranscript);
      formData.append("passingPercentage", data.passingPercentage);
      // formData.append("courseDate", JSON.stringify(data.courseDate));

      const res = await axiosInstance.put(
        `course/editCourseBasics/${courseId}`,
        formData
      );

      // Dismiss loading toast and show success
      toast.success(res.data.message || "Course updated successfully!");

      reset();
      navigate(`/teacher/courses/courseDetail/${courseId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors) => {
    toast.error("Please fill out all required fields correctly.");
    console.log(errors);
  };

  return (
    <div>
      <BackButton className="mb-10" />
      <p className="text-xl py-4 mb-8 pl-6 font-semibold bg-acewall-main text-white rounded-lg">
        Edit Course Info
      </p>
      <FormProvider
        {...{
          register,
          handleSubmit,
          control,
          setValue,
          reset,
          formState: { errors, isSubmitting },
          watch,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
          <section>
            <div className="space-y-6">
              <div className="max-w-md mb-6">
                <CourseTypeDropdown
                  value={watch("courseType")}
                  onChange={(val) => {
                    setValue("courseType", val);
                    setValue("offersCertificate", val === "certificate");
                    setValue("offersTranscript", val === "transcript");
                  }}
                />

                {watch("courseType") !== "normal" && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="passingPercentage" className="font-semibold">
                      Minimum Passing Percentage (%)
                    </Label>
                    <Input
                      id="passingPercentage"
                      type="number"
                      min="0"
                      max="100"
                      {...register("passingPercentage", { valueAsNumber: true })}
                      className={`bg-gray-50 ${errors.passingPercentage ? "border border-red-500" : ""}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Students must score at least this percentage in the final assessment to get the {watch("courseType")}.
                    </p>
                    {errors.passingPercentage && (
                      <p className="text-xs text-red-500">{errors.passingPercentage.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="courseTitle" className="block mb-2">
                    Course Title
                  </Label>
                  <Input
                    id="courseTitle"
                    maxLength={50}
                    className={`bg-gray-50 ${errors.courseTitle ? "border border-red-500" : ""
                      }`}
                    {...register("courseTitle")}
                  />
                  {errors.courseTitle && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.courseTitle.message}
                    </p>
                  )}
                </div>

                {/* Category */}
                <CategorySelect
                  register={register}
                  errors={errors}
                  control={control}
                  setCategories={setCategories}
                  categories={categories}
                  prevCategory={prevCategory}
                  watchedCategory={watchedCategory}
                  onCategoryChange={(value) => setSelectedCategory(value)}
                />

                <SubCategorySelect
                  register={register}
                  errors={errors}
                  control={control}
                  setSubcategories={setSubcategories}
                  subcategories={subcategories}
                  prevSubCategory={prevSubCategory}
                  watchedSubCategory={watchedSubCategory}
                  selectedCategory={selectedCategory}
                />
              </div>

              <div>
                <Label htmlFor="price" className="block mb-2">
                  Course Price (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  max="9999"
                  inputMode="decimal"
                  placeholder="Enter course price"
                  className={`bg-gray-50 ${errors.price ? "border border-red-500" : ""}`}
                  {...register("price", {
                    valueAsNumber: true,
                    validate: (value) => {
                      if (isNaN(value)) return "Price is required";
                      if (value < 0) return "Price must be a non-negative number";
                      if (value > 9999) return "Price must not exceed 9999";
                      return true;
                    },
                  })}
                  onInput={(e) => {
                    const value = parseFloat(e.currentTarget.value);
                    if (value > 9999) {
                      e.currentTarget.value = "9999";
                    }
                  }}
                />

                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
                )}
              </div>


              <div>
                <Label htmlFor="language" className="block mb-2">
                  Language
                </Label>
                <Select
                  onValueChange={(value) => {
                    setValue("language", value, { shouldValidate: true });
                  }}
                  value={watchedLanguage}
                  className="max-w-xs"
                >
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue
                      placeholder="Select language"
                      defaultValues={"english"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
                {errors.language && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.language.message}
                  </p>
                )}
              </div>

              <div className="">
                <Label htmlFor="courseDescription" className="block mb-2">
                  Course Description
                </Label>
                <Textarea
                  id="courseDescription"
                  className={`min-h-[100px] bg-gray-50  ${errors.courseDescription ? "border border-red-500" : ""
                    }`}
                  maxLength={4000}
                  {...register("courseDescription")}
                />
                {errors.courseDescription && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.courseDescription.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-10 mb-6">
              <h2 className="text-xl font-semibold">Make The Course</h2>
            </div>
            <section className="my-4">
              <h3 className="text-lg font-medium mb-4">
                What you will teach in this course{" "}
                <span className="text-gray-500 text-xs">(max 10)</span>
              </h3>
              {teachingPointsFields.map((field, index) => (
                <TeachingPointInput
                  key={field.id}
                  field={field}
                  index={index}
                  teachingPointsFields={teachingPointsFields}
                  remove={removeTeachingPoint}
                  error={errors.teachingPoints?.[index]?.value}
                  control={control}
                  register={register}
                />
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={teachingPointsFields.length >= 10}
                  onClick={() => appendTeachingPoint({ value: "" })}
                  className={`mt-2 text-blue-500 text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-blue-50 ${teachingPointsFields.length >= 10
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                    }`}
                >
                  + Add Teaching Point
                </button>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-4">
                Course Requirements{" "}
                <span className="text-gray-500 text-xs">(max 10)</span>
              </h3>
              {requirementsFields.map((field, index) => (
                <RequirementInput
                  key={field.id}
                  field={field}
                  index={index}
                  requirementsFields={requirementsFields}
                  remove={removeRequirement}
                  error={errors.requirements?.[index]?.value}
                  register={register}
                />
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => appendRequirement({ value: "" })}
                  className={`mt-2 text-blue-500 text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-blue-50 ${requirementsFields.length >= 10
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                    }`}
                  disabled={requirementsFields.length >= 10}
                >
                  + Add Requirement
                </button>
              </div>
            </section>
          </section>

          <div className="flex justify-end mt-25">
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 "
              disabled={loading}
            >
              {loading ? "Creating..." : "Update Course Info"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
