import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlignLeft, Pencil, Eye, Trash2, Calendar } from "lucide-react";

export default function AssessmentCard({ Assessment }) {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50">
      <div className="flex items-center w-16">
        <AlignLeft className="h-5 w-5 text-gray-500" />
      </div>
      <div className="flex-1">
        <div className="text-blue-500 font-medium">Quiz {Assessment.id}</div>
        <div className="font-medium text-lg">{Assessment.title}</div>
        <div className="text-sm text-gray-500">
          {Assessment.questions} questions | {Assessment.points} pts
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded">
          <Calendar className="h-4 w-4 mr-1" />
          {Assessment.dueDate}
        </div>
        <Button variant="ghost" size="icon">
          <Pencil className="h-5 w-5 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon">
          <Eye className="h-5 w-5 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
