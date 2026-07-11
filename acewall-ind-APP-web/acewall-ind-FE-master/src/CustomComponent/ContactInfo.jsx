import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const ContactInfo = ({ formData, handleInputChange }) => {
  return (
    <>
      <div>
        <Label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Email Address*
        </Label>
        <Input
          type="email"
          name="email"
          id="email"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="name@company.com"
          required
          value={formData.email || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Phone Number
        </Label>
        <Input
          type="tel"
          name="phone"
          id="phone"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="(123) 456-7890"
          required
          value={formData.phone || ""}
          onChange={handleInputChange}
        />
      </div>
    </>
  )
}

export default ContactInfo

