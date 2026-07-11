import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const MultiLevelDropdown = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleMainItemClick = (item) => {
    if (item.link) {
      navigate(item.link);
    }
    setOpen(false);
  };

  const handleSubTriggerClick = (e, link) => {
    e.preventDefault(); // Prevent default behavior
    navigate(link);
    setOpen(false); // Close the dropdown
  };

  const handleSubItemClick = (subItem) => {
    if (subItem.link) {
      navigate(subItem.link);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 font-medium hover:text-primary">
        {label} <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.subItems ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className="flex items-center justify-between"
                  onClick={(e) => handleSubTriggerClick(e, item.link)}
                >
                  {item.label}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-56">
                    {item.subItems.map((subItem, subIndex) => (
                      <DropdownMenuItem
                        key={subIndex}
                        onClick={() =>
                          handleSubItemClick({ ...subItem, link: subItem.link })
                        }
                      >
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )
             :
             (
              ""
              // <Link to={item.link} key={index}>
              //   <DropdownMenuItem
              //     className={""}
              //     onClick={() => handleCourseClick(item)}
              //   >
              //     {item.label}
              //   </DropdownMenuItem>
              // </Link>
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
