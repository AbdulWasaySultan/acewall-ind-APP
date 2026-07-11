import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { Label } from "@/components/ui/label";
import profileImg from "@/assets/avatar.png";

const EditDueDateForStudent = ({
  editfor,
  assessment,
  students,
  setStudents,
  selectedStudents,
  setSelectedStudents,
}) => {
  const [open, setOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await axiosInstance.get(
        `course/getStudentofCourse/${editfor === "discussion" ? assessment.course._id : assessment.course}`,
      );

      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (assessment?.course) {
      fetchStudents();
    }
  }, [assessment?.course._id]);

  const toggleStudent = (student) => {
    const exists = selectedStudents.find((s) => s._id === student._id);

    if (exists) {
      setSelectedStudents(
        selectedStudents.filter((s) => s._id !== student._id),
      );
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const removeStudent = (id) => {
    setSelectedStudents(selectedStudents.filter((s) => s._id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <Label>Select Students</Label>

        {/* Dropdown - Added modal={true} to fix Modal/Dialog focus trap conflicts */}
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-[350px] justify-between"
            >
              {selectedStudents.length > 0
                ? `${selectedStudents.length} student(s) selected`
                : "Select students..."}

              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[350px] p-0">
            <Command>
              <CommandInput placeholder="Search student..." />

              <CommandEmpty>No student found.</CommandEmpty>

              <CommandGroup>
                {students.map((student) => {
                  const isSelected = selectedStudents.some(
                    (s) => s._id === student._id,
                  );

                  return (
                    <CommandItem
                      key={student._id}
                      value={`${student.firstName} ${student.lastName} ${student._id}`}
                      onSelect={() => toggleStudent(student)}
                      // Removed the onMouseDown override so selecting works natively again
                    >
                      <div className="flex items-center gap-3 w-full">
                        <img
                          src={student?.profileImg?.url || profileImg}
                          alt={`${student.firstName} avatar`}
                          className="w-8 h-8 rounded-full object-cover"
                        />

                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {student.firstName} {student.middleName}{" "}
                            {student.lastName}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {student.email}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="ml-auto h-4 w-4 text-green-600" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Students List */}
      {selectedStudents.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Selected Students
          </Label>

          <div className="space-y-2">
            {selectedStudents.map((student) => {
              return (
                <div
                  key={student._id}
                  className="flex items-center justify-between border rounded-md p-2 w-[350px]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student?.profileImg?.url || profileImg}
                      alt={`${student.firstName} avatar`}
                      className="w-8 h-8 rounded-full"
                    />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {student.firstName} {student.lastName}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {student.email}
                      </span>
                    </div>
                  </div>

                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-red-500"
                    onClick={() => removeStudent(student._id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDueDateForStudent;
