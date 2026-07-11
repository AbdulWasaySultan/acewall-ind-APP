import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import avatar from "@/assets/avatar.png"; // default avatar

export const StudentCard = ({ student }) => (
  <Card className="overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white">
    <CardContent className="px-6 py-4 flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="w-24 h-24 ring-3 ring-gray-500 shadow-sm">
          <AvatarImage
            src={student.profileImg?.url || avatar}
            alt={`${student.firstName} ${student.lastName}`}
            className="rounded-full object-cover"
          />
          <AvatarFallback className="bg-gray-200 text-gray-600 text-xl font-semibold flex items-center justify-center">
            {student.firstName[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800">{student.firstName}</h3>
        <p className="text-sm text-gray-500">{student.email}</p>
      </div>

      <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-2">
        <span className="text-gray-500">Joined</span>
        <span className="text-right text-gray-700 font-medium">
          {new Date(student.createdAt).toLocaleDateString()}
        </span>
      </div>

      <Button className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-300">
        View Profile
      </Button>
    </CardContent>
  </Card>
);
