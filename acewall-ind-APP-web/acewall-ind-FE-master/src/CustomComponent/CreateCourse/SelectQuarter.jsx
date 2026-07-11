import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/AxiosInstance";
import { ChevronDown } from "lucide-react";

const SelectQuarter = ({
  register,
  errors,
  selectedSemester,
  prevSelectedQuarters,
}) => {
  const [quarters, setQuarters] = useState([]);
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!selectedSemester || selectedSemester.length === 0) {
      setQuarters([]);
      setSelectedQuarters([]); // reset selection
      return;
    }

    const fetchQuarters = async () => {
      try {
        const res = await axiosInstance.post(`quarter/getquarters`, {
          semesters: selectedSemester,
        });
        setQuarters(res.data.quarters || []);
      } catch (err) {
        console.error("Failed to fetch quarters:", err);
      }
    };

    fetchQuarters();
  }, [selectedSemester]);

  const toggleQuarter = (id) => {
    setSelectedQuarters((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const confirmSelection = () => {
    register("quarter").onChange({
      target: { name: "quarter", value: selectedQuarters },
    });
    setOpen(false);
  };

  const selectedTitles = quarters
    .filter((q) => selectedQuarters.includes(q._id))
    .map((q) => q.title)
    .join(", ");

  return (
    <div>
      <Label htmlFor="quarter" className="block mb-2">
        Quarter
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={!selectedSemester}
          >
            {selectedQuarters.length > 0 ? selectedTitles : "Select Quarter(s)"}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-4 space-y-2">
          <ScrollArea className="h-48 pr-2">
            {quarters.map((q) => (
              <div key={q._id} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={q._id}
                  checked={
                    selectedQuarters.includes(q._id) ||
                    (prevSelectedQuarters?.length &&
                      prevSelectedQuarters.includes(q._id))
                  }
                  onCheckedChange={() => toggleQuarter(q._id)}
                />
                <label htmlFor={q._id} className="text-sm">
                  {q.title}
                </label>
              </div>
            ))}
          </ScrollArea>

          <Button size="sm" className="w-full mt-2" onClick={confirmSelection}>
            Select
          </Button>
        </PopoverContent>
      </Popover>

      <input type="hidden" {...register("quarter")} value={selectedQuarters} />

      {errors?.quarter && (
        <p className="text-xs text-red-500 mt-1">{errors.quarter.message}</p>
      )}
    </div>
  );
};

export default SelectQuarter;
