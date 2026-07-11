import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Save, X, Loader2 } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { toast } from "sonner";

export default function AssessmentCategoryDialog({ courseId }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", weight: "" });
  const [editingWeights, setEditingWeights] = useState({});
  const [loading, setLoading] = useState(false);

  console.log(courseId, "courseId in AssessmentCategoryDialog");

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get(`assessmentCategory/${courseId}`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (open) fetchCategories();
  }, [loading, courseId, open]);

  const handleWeightChange = (categoryId, newWeight) => {
    setEditingWeights((prev) => ({
      ...prev,
      [categoryId]: newWeight,
    }));
  };

  const handleSaveWeight = async (categoryId) => {
    const newWeight = editingWeights[categoryId];
    if (newWeight !== undefined && newWeight !== "") {
      setLoading(true);
      try {
        const res = await axiosInstance.put(`assessmentCategory/${courseId}/${categoryId}`, {
          weight: Number.parseFloat(newWeight),
        });
        setLoading(false);
        toast.success(res.data.message || "Weight updated successfully");
        setEditingWeights((prev) => {
          const next = { ...prev };
          delete next[categoryId];
          return next;
        });
      } catch (err) {
        setLoading(false);
        toast.error(err.response?.data?.message || "Failed to update weight");
      }
    }
  };

  const handleAddCategory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(`assessmentCategory/${courseId}`, {
        name: newCategory.name,
        weight: Number.parseFloat(newCategory.weight),
      });
      setLoading(false);
      setNewCategory({ name: "", weight: "" });
      toast.success(res.data.message || "Category added successfully");
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.delete(`assessmentCategory/${categoryId}`);
      setLoading(false);
      toast.success(res.data.message || "Category deleted successfully");
      setCategories((prev) => (prev ? prev.filter((cat) => cat._id !== categoryId) : []));
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const getDisplayWeight = (category) => {
    return editingWeights[category._id] !== undefined ? editingWeights[category._id] : category.weight;
  };

  const totalWeight = categories?.reduce((sum, cat) => sum + (parseFloat(cat.weight) || 0), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-haspopup="dialog">Manage Assessment Categories</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" id="category-dialog">
        <DialogHeader>
          <DialogTitle>Assessment Categories</DialogTitle>
          <DialogDescription>
            Manage your course assessment categories and their weights. Ensure total weights do not exceed 100%.
          </DialogDescription>
        </DialogHeader>

        

        <div className="space-y-6">
          <section className="border rounded-lg" aria-label="Existing Categories">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Category Name</TableHead>
                  <TableHead scope="col">Weight (%)</TableHead>
                  <TableHead scope="col" className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={getDisplayWeight(category)}
                        onChange={(e) => handleWeightChange(category._id, e.target.value)}
                        className="w-24"
                        min="0"
                        max="100"
                        aria-label={`Weight percentage for ${category.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveWeight(category._id)}
                          disabled={editingWeights[category._id] === undefined || loading}
                          title="Save updated weight"
                        >
                          <Save className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Save weight for {category.name}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteCategory(category._id)}
                          disabled={loading}
                          title="Delete category"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Delete category {category.name}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="border rounded-lg p-4 bg-muted/50" aria-labelledby="add-category-heading">
            <h4 id="add-category-heading" className="font-medium mb-3">Add New Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Midterm"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryWeight">Weight (%)</Label>
                <Input
                  id="categoryWeight"
                  type="number"
                  placeholder="0-100"
                  value={newCategory.weight}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, weight: e.target.value }))}
                  min="0"
                  max="100"
                  required
                />
              </div>
              <Button
                onClick={handleAddCategory}
                disabled={!newCategory.name || !newCategory.weight || loading}
                className="w-full md:w-auto"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Category
              </Button>
            </div>
          </section>

          <div 
            className={`flex justify-between items-center p-3 rounded-lg ${totalWeight > 100 ? 'bg-red-100 text-red-900' : 'bg-muted'}`}
            role="status" 
            aria-live="polite"
          >
            <span className="font-medium">Total Course Weight:</span>
            <span className={`font-bold text-lg ${totalWeight > 100 ? 'text-red-600' : ''}`}>
              {totalWeight}%
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}