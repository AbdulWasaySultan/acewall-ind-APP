import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";

export const AssessmentTable = ({ title, items, isFinal = false }) => {
  // Handle both array and single item cases
  const itemsArray = Array.isArray(items) ? items : [items];

  if (itemsArray.length === 0) return null;

  return (
    <div>
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      <Table className={"overflow-x-scroll"}>
        <TableHeader>
          <TableRow>
            <TableHead className={"w-2/6"}>Title</TableHead>
            <TableHead className={"w-1/6"} >Chapter</TableHead>
            <TableHead className={"w-1/6"}>Points</TableHead>
            <TableHead className={"w-1/6"}>Obtained</TableHead>
            <TableHead className={"w-1/6"}>Percentage</TableHead>
          </TableRow>
        </TableHeader> 
        <TableBody>
          {itemsArray.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="flex items-center gap-2 ">
                <FileText className="h-4 w-4 text-gray-500" />
                {item.title}
              </TableCell>
              <TableCell>{isFinal ? "Final" : item.chapter}</TableCell>
              <TableCell>{item.marks}</TableCell>
              <TableCell>{item.obtMarks}</TableCell>
              <TableCell>
                <div className="flex items-center gap-5">
                  <span>
                    {((item.obtMarks / item.marks) * 100).toFixed(0)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
