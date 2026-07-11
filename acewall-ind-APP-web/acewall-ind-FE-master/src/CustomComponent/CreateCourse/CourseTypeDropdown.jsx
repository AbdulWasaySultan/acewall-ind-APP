import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CourseTypeDropdown = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor="courseType" className="font-semibold">Course Type</Label>
            <Select
                value={value}
                onValueChange={(val) => {
                    onChange(val);
                }}
            >
                <SelectTrigger id="courseType" className="w-full bg-gray-50 border-gray-300">
                    <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="normal">Normal Course</SelectItem>
                    <SelectItem value="transcript">Transcript Course</SelectItem>
                    <SelectItem value="certificate">Certificate Course</SelectItem>
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
                {value === "certificate" && "Certificate course: Students can generate a certificate upon completion."}
                {value === "transcript" && "Transcript course: Students must request a transcript from the teacher."}
                {value === "normal" && "Normal Course: Standard course with no formal certificate or transcript."}
            </p>
        </div>
    );
};

export default CourseTypeDropdown;
