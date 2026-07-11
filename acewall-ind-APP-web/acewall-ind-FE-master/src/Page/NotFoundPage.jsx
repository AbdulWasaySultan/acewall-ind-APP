import { Link } from "react-router-dom"; 
export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-screen  px-4">
      <div className="text-center space-y-6">
        <p className="text-2xl font-medium text-gray-800">Oops! Page not found.</p>
        <p className="text-lg text-gray-500">
          The page you're looking for doesn’t exist or has been moved.
        </p>
        <img className="w-80 mx-auto" src="https://img.freepik.com/free-vector/404-error-with-person-looking-concept-illustration_114360-7912.jpg?ga=GA1.1.1453766052.1744756388&semt=ais_hybrid&w=740" alt="404 Illustration" />
        <Link
          to="/"
          className="inline-block px-8 py-3 mt-6 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-300"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
