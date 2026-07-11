import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Ticket } from "lucide-react";
import { axiosInstance } from "@/lib/AxiosInstance";
import { useParams } from "react-router-dom";
import BackButton from "@/CustomComponent/BackButton";
import toast from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(3).max(15).toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  percentageOff: z.coerce.number().min(1).max(100).optional(),
  maxRedemptions: z.coerce.number().min(1).optional(),
  expiresAt: z.string().optional(),
});

export function TeacherCouponDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const { courseId } = useParams();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      discountType: "percentage",
      percentageOff: 0,
      amountOff: 0,
      maxRedemptions: 1,
      expiresAt: "",
    },
  });

  const fetchMyCoupons = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/coupon/getBycourse/${courseId}`,
      );
      setCoupons(data.coupons);
    } catch (err) {
      console.error("Failed to fetch coupons");
    }
  };

  useEffect(() => {
    fetchMyCoupons();
  }, [courseId]);

  const handleInActive = async (couponId, status) => {
    try {
      await axiosInstance.patch(`/coupon/updateCoupon/${couponId}`, {
        status,
      });
      fetchMyCoupons();
    } catch (err) {
      console.error("Failed to update coupon status");
    }
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      courseId,
    };

    setLoading(true);
    try {
      await axiosInstance.post("/coupon/createCoupon", payload);
      form.reset();
      fetchMyCoupons();
      toast.success("Coupon created successfully!");
    } catch (error) {
      console.error("Error submitting coupon:", error);
      toast.error(
        error.message || "Failed to create coupon. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-10">
      <BackButton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" /> Create Coupon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Winter Sale 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon Code</FormLabel>
                        <FormControl>
                          <Input placeholder="SAVE50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="percentageOff"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount %</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxRedemptions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Uses</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Stripe Coupon
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        {/* Right Side: Detailed Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" /> Active Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code & Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell>
                      <div className="font-bold">{coupon.code}</div>
                      <div className="text-xs text-muted-foreground">
                        {coupon.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === "percentage"
                        ? `${coupon.percentageOff}% Off`
                        : `$${coupon.amountOff} Off`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.isActive ? "success" : "secondary"}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      Max: {coupon.maxRedemptions || "∞"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInActive(coupon._id, !coupon.isActive)}
                      >
                        {coupon.isActive ? "Set Inactive" : "Set Active"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
