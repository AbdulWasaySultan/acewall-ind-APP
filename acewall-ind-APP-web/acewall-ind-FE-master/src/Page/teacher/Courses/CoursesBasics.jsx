import React, { useContext, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { FileIcon, Loader, Upload, X } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { CourseContext } from "@/Context/CoursesProvider";
import CategorySelect from "@/CustomComponent/CreateCourse/CategorySelect";
import { GlobalContext } from "@/Context/GlobalProvider";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";
import SubCategorySelect from "@/CustomComponent/CreateCourse/SubCategorySelect";
import TeachingPointInput from "@/CustomComponent/CreateCourse/TeachingPoints";
import RequirementInput from "@/CustomComponent/CreateCourse/Requirment";
import AiContentModal from "@/CustomComponent/teacher/teacher/AiContentModal";
import PaymenttypeDropdown from "@/CustomComponent/CreateCourse/PaymenttypeDropdown";
import TrialPeriodDropdown from "@/CustomComponent/CreateCourse/TrialPeriodDropdown";
import LanguageDropdown from "@/CustomComponent/CreateCourse/LanguageDropdown";
import SemesterbasedDropdown from "@/CustomComponent/CreateCourse/semesterbasedDropdown";
import CoursePriceDropdown from "@/CustomComponent/CreateCourse/CoursePriceDropdown";
import CourseDescription from "@/CustomComponent/CreateCourse/CourseDescription";
import CourseTypeDropdown from "@/CustomComponent/CreateCourse/CourseTypeDropdown";

const documentSchema = z.object({
  file: z.any().refine((file) => file instanceof File, {
    message: "Document file is required",
  }),
});

const courseFormSchema = z.object({
  thumbnail: z.any().refine((file) => file instanceof File, {
    message: "Thumbnail is required",
  }),
  courseTitle: z
    .string()
    .min(5, { message: "Course title must be at least 5 characters" })
    .max(100, { message: "Course title must be less than 100 characters" }),
  category: z
    .string()
    .min(1, { message: "Please select a category" })
    .refine((val) => val !== "", { message: "Please select a category" }),
  subcategory: z
    .string()
    .min(1, { message: "Please select a subcategory" })
    .refine((val) => val !== "", { message: "Please select a subcategory" }),
  semesterbased: z.boolean(),
  language: z
    .string()
    .min(1, { message: "Please select a language" })
    .refine((val) => val !== "", { message: "Please select a language" }),
  courseDescription: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" })
    .max(4000, { message: "Description must be less than 2500 characters" }),
  teachingPoints: z
    .array(
      z.object({
        value: z
          .string()
          .min(5, "Min 5 characters.")
          .max(120, "Max 120 characters."),
      }),
    )
    .min(1, { message: "Add at least one teaching point." }),
  requirements: z
    .array(
      z.object({
        value: z
          .string()
          .min(5, "Min 5 characters.")
          .max(120, "Max 120 characters."),
      }),
    )
    .min(1, { message: "Add at least one requirement." }),
  paymentType: z.enum(["FREE", "ONETIME", "SUBSCRIPTION"]),
  freeTrialMonths: z.any().optional(),
  price: z
    .string()
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Price must be a valid non-negative number",
    })
    .refine((val) => val === "" || Number(val) <= 9999, {
      message: "Price must not exceed 4 digits",
    })
    .optional(),
  courseType: z.enum(["normal", "transcript", "certificate"]).default("normal"),
  offersCertificate: z.boolean().default(false),
  offersTranscript: z.boolean().default(false),
  passingPercentage: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
      message: "Percentage must be between 0 and 100",
    })
    .default("80"),
});

export default function CoursesBasis() {
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [aiResponse, setAiResponse] = useState({
    content: "",
    usedfor: "",
  });
  const { user } = useContext(GlobalContext);
  const { course, setCourse } = useContext(CourseContext);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [courseDocument, setCourseDocument] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("subcategory/get")
      .then((res) => {
        console.log("subcategroy", res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  useEffect(() => {
    axiosInstance
      .get("category/get")
      .then((res) => {
        console.log("category", res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      courseTitle: "",
      category: "",
      subcategory: "",
      language: "english",
      courseDescription: "",
      teachingPoints: [{ value: "" }],
      requirements: [{ value: "" }],
      price: "",
      courseType: "normal",
      offersCertificate: false,
      offersTranscript: false,
      passingPercentage: "80",
      semesterbased: false,
      paymentType: "FREE"
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  const watchedLanguage = watch("language");
  const watchedSemesterbased = watch("semesterbased");
  const watchRequirement = watch("requirements");
  const watchteacherpoints = watch("teachingPoints");
  const watchedDescription = watch("courseDescription");
  const watchedpaymentType = watch("paymentType");

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
      toast.error("Only JPG/PNG images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be less than 5MB.");
      return;
    }

    setValue("thumbnail", file, { shouldValidate: true });

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    setLoading(true);
    try {
      formData.append("thumbnail", data.thumbnail);
      formData.append("courseTitle", data.courseTitle);
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory);
      formData.append("semesterbased", data.semesterbased);
      formData.append("courseDescription", data.courseDescription);
      formData.append(
        "teachingPoints",
        JSON.stringify(data.teachingPoints.map((tp) => tp.value)),
      );
      formData.append(
        "requirements",
        JSON.stringify(data.requirements.map((req) => req.value)),
      );
      formData.append("price", data.price);
      formData.append("offersCertificate", data.offersCertificate);
      formData.append("offersTranscript", data.offersTranscript);
      formData.append("passingPercentage", data.passingPercentage || "80");
      formData.append("published", true);
      formData.append("paymentType", data.paymentType);
      if (data.paymentType === "SUBSCRIPTION") {
        formData.append("freeTrialMonths", data.freeTrialMonths || "0");
      }

      const res = await axiosInstance.post("course/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Course created successfully!");

      reset();
      navigate("/teacher/courses");
    } catch (err) {
      console.log(err, "error");
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
    <div role="main" aria-labelledby="create-course-heading">
      <h1
        id="create-course-heading"
        className="text-xl py-4 mb-8 pl-6 font-semibold bg-acewall-main text-white rounded-lg"
      >
        Create Course
      </h1>

      <p id="form-instructions" className="sr-only">
        All fields marked with an asterisk are required.
      </p>

      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="space-y-8"
          noValidate
          aria-describedby="form-instructions"
        >
          <section>
            <div className="space-y-6">
              <section className="space-y-6 border-b pb-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="thumbnail" className="font-medium">
                    Thumbnail *
                  </Label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-md p-2 max-w-md">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Uploaded course thumbnail preview"
                        className="w-full h-[300px] object-cover rounded"
                      />

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        aria-label="Remove uploaded thumbnail"
                        className="absolute bottom-2 right-2"
                        onClick={() => {
                          setThumbnailPreview(null);
                          setValue("thumbnail", null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <input
                        type="file"
                        id="thumbnailInput"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                        aria-describedby="thumbnailHelp"
                      />

                      <label
                        htmlFor="thumbnailInput"
                        role="button"
                        tabIndex={0}
                        aria-label="Upload course thumbnail"
                        className="flex items-center gap-2 px-4 py-1 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Upload
                          size={"18"}
                          className="text-xs text-gray-600"
                          aria-hidden="true"
                        />
                        Upload Thumbnail
                      </label>
                      <div className="ml-4 border-l pl-4 text-xs text-gray-500 flex items-center gap-2">
                        <AiContentModal
                          aiResponse={aiResponse}
                          setAiResponse={setAiResponse}
                          usedfor="thumbnail"
                          handleThumbnailChange={handleThumbnailChange}
                        />
                        generate with AI
                      </div>
                    </div>
                  )}
                </div>

                {errors.thumbnail && (
                  <p
                    className="text-xs text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.thumbnail.message}
                  </p>
                )}
              </section>

              <div className="max-w-md">
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
                      {...register("passingPercentage")}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <Label htmlFor="courseTitle" className="block mb-2">
                    Course Title *
                  </Label>
                  <Input
                    id="courseTitle"
                    maxLength={50}
                    aria-invalid={!!errors.courseTitle}
                    aria-describedby={
                      errors.courseTitle ? "courseTitle-error" : undefined
                    }
                    className={`bg-gray-50 ${errors.courseTitle ? "border border-red-500" : ""
                      }`}
                    {...register("courseTitle")}
                  />
                  {errors.courseTitle && (
                    <p
                      id="courseTitle-error"
                      role="alert"
                      className="text-xs text-red-500 mt-1"
                    >
                      {errors.courseTitle.message}
                    </p>
                  )}
                </div>

                <PaymenttypeDropdown register={register} errors={errors} />

                {(watchedpaymentType === "SUBSCRIPTION" ||
                  watchedpaymentType === "ONETIME") && (
                    <CoursePriceDropdown register={register} errors={errors} />
                  )}

                {watchedpaymentType === "SUBSCRIPTION" && (
                  <TrialPeriodDropdown
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                )}

                <CategorySelect
                  register={register}
                  errors={errors}
                  onCategoryChange={(value) => setSelectedCategory(value)}
                />

                <SubCategorySelect
                  register={register}
                  errors={errors}
                  selectedCategory={selectedCategory}
                />
              </div>

              {/* Semester & Language */}
              <section className="flex gap-6 justify-between">
                <SemesterbasedDropdown
                  errors={errors}
                  setValue={setValue}
                  watchedSemesterbased={watchedSemesterbased}
                />

                <LanguageDropdown
                  errors={errors}
                  setValue={setValue}
                  watchedLanguage={watchedLanguage}
                />
              </section>

              {/* Description */}
              <CourseDescription
                watchedDescription={watchedDescription}
                aiResponse={aiResponse}
                setAiResponse={setAiResponse}
                setValue={setValue}
                errors={errors}
                register={register}
              />
            </div>

            {/* Teaching Points */}
            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium mb-3">
                  What you will teach *
                </h2>
                <div className="m-3">
                  <AiContentModal
                    aiResponse={aiResponse}
                    setAiResponse={setAiResponse}
                    usedfor="teachingPoints"
                    appendTeachingPoint={appendTeachingPoint}
                    removeTeachingPoint={removeTeachingPoint}
                    prevPoints={watchteacherpoints}
                  />
                </div>
              </div>

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

              <Button
                type="button"
                className="mt-3"
                disabled={teachingPointsFields.length >= 10}
                onClick={() => appendTeachingPoint({ value: "" })}
              >
                + Add Teaching Point
              </Button>
            </section>

            {/* Requirements */}
            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium mb-3">
                  Course Requirements *
                </h2>
                <div className="">
                  <AiContentModal
                    aiResponse={aiResponse}
                    setAiResponse={setAiResponse}
                    usedfor="requirements"
                    appendRequirement={appendRequirement}
                    removeRequirement={removeRequirement}
                    prevPoints={watchRequirement}
                  />
                </div>
              </div>

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

              <Button
                type="button"
                className="mt-3"
                disabled={requirementsFields.length >= 10}
                onClick={() => appendRequirement({ value: "" })}
              >
                + Add Requirement
              </Button>
            </section>
          </section>

          {/* Submit */}
          <div className="flex justify-end mt-10">
            <Button
              type="submit"
              aria-busy={loading}
              aria-disabled={loading}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
