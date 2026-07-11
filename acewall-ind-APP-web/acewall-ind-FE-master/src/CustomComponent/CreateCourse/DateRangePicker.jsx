import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

export default function DateRangePicker({ name = "courseDate" }) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const startDate = watch(`${name}.start`);
  const endDate = watch(`${name}.end`);

  useEffect(() => {
    if (startDate && endDate && isAfter(new Date(endDate), new Date(startDate))) {
      setValue(`${name}.range`, {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
      });
    } else {
      setValue(`${name}.range`, null);
    }
  }, [startDate, endDate, setValue, name]);

// Set default start and end date to today if not set
useEffect(() => {
    const todayISO = new Date().toISOString();
    if (!startDate) {
        setValue(`${name}.start`, todayISO);
    }
    // if (!endDate) {
    //     setValue(`${name}.end`, todayISO);
    // }
}, [startDate, endDate, setValue, name]);

return (
    <div className="space-y-4 p-4 rounded-xl shadow-md border">
        <div className="space-y-2">
            <Label>Start Date</Label>
            <Controller
                name={`${name}.start`}
                control={control}
                render={({ field }) => (
                    <Popover open={openStart} onOpenChange={setOpenStart}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenStart(true);
                                }}
                            >
                                {field.value ? format(new Date(field.value), "PPP") : "Pick a start date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        field.onChange(date.toISOString());
                                        setOpenStart(false);
                                    }
                                }}
                                disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors?.[name]?.start && (
                <p className="text-sm text-red-500">{errors[name].start.message}</p>
            )}
        </div>

        <div className="space-y-2">
            <Label>End Date</Label>
            <Controller
                name={`${name}.end`}
                control={control}
                render={({ field }) => (
                    <Popover open={openEnd} onOpenChange={setOpenEnd}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenEnd(true);
                                }}
                            >
                                {field.value ? format(new Date(field.value), "PPP") : "Pick an end date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                    if (date && (!startDate || !isBefore(date, new Date(startDate)))) {
                                        field.onChange(date.toISOString());
                                        setOpenEnd(false);
                                    }
                                }}
                                disabled={(date) =>
                                    !startDate || isBefore(date, new Date(startDate))
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors?.[name]?.end && (
                <p className="text-sm text-red-500">{errors[name].end.message}</p>
            )}
        </div>

        {startDate && endDate && (
            <div className="text-green-600 font-medium text-center">
                Selected Range: {format(new Date(startDate), "PPP")} to{" "}
                {format(new Date(endDate), "PPP")}
            </div>
        )}
    </div>
);
}
