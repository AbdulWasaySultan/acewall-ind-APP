import { DocumentAttachmentIcon } from "@/assets/Icons/Document";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputFile() {
  return (
    <div className="w-full max-w-sm items-center flex gap-1.5">
      <div className="relative inline-block">
        <Input
          type="file"
          id="file-upload"
          className="absolute opacity-0 w-full h-full cursor-pointer"
          //   onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-green-400 rounded-full cursor-pointer hover:bg-green-600 transition-colors duration-300"
        >
          {/* <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> */}
          <DocumentAttachmentIcon className="mr-2"  />
          Upload Document
        </label>
      </div>

      {/* <Input id="picture" type="file" className={""} /> */}
    </div>
  );
}
