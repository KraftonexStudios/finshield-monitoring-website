"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { addUser } from "@/services/firebase";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

const userSchema = z.object({
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  emailId: z.string().email("Invalid email address"),
  age: z.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
  gender: z.enum(["male", "female"], { required_error: "Please select gender" }),
  profile: z.string().optional(),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(8, "Account number must be at least 8 digits"),
  ifscCode: z.string().min(11, "IFSC code must be 11 characters").max(11, "IFSC code must be 11 characters"),
  branchName: z.string().min(2, "Branch name is required"),
  accountType: z.enum(["savings", "current"], { required_error: "Please select account type" }),
  balance: z.number().min(0, "Balance cannot be negative"),
});

type UserFormData = z.infer<typeof userSchema>;

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { addUser: addUserToStore } = useStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      const userData = {
        mobile: data.mobile,
        fullName: data.fullName,
        emailId: data.emailId,
        age: data.age,
        gender: data.gender,
        profile: data.profile || null,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        branchName: data.branchName,
        accountType: data.accountType,
        balance: data.balance,
      };

      const userId = await addUser(userData);
      toast.success("User registered successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Failed to register user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              User Registration
            </CardTitle>
            <CardDescription>
              Register a new user with their personal and banking information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...register("fullName")}
                      placeholder="Enter full name"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      {...register("mobile")}
                      placeholder="+919876543210"
                    />
                    {errors.mobile && (
                      <p className="text-sm text-red-600">{errors.mobile.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="emailId">Email Address</Label>
                    <Input
                      id="emailId"
                      type="email"
                      {...register("emailId")}
                      placeholder="Enter email address"
                    />
                    {errors.emailId && (
                      <p className="text-sm text-red-600">{errors.emailId.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      {...register("age", { valueAsNumber: true })}
                      placeholder="Enter age"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600">{errors.age.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setValue("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="profile">Profile Image URL (Optional)</Label>
                  <Input
                    id="profile"
                    {...register("profile")}
                    placeholder="https://example.com/profile.jpg"
                  />
                  {errors.profile && (
                    <p className="text-sm text-red-600">{errors.profile.message}</p>
                  )}
                </div>
              </div>

              {/* Banking Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Banking Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      {...register("bankName")}
                      placeholder="Enter bank name"
                    />
                    {errors.bankName && (
                      <p className="text-sm text-red-600">{errors.bankName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      {...register("accountNumber")}
                      placeholder="Enter account number"
                    />
                    {errors.accountNumber && (
                      <p className="text-sm text-red-600">{errors.accountNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      {...register("ifscCode")}
                      placeholder="Enter IFSC code"
                      maxLength={11}
                    />
                    {errors.ifscCode && (
                      <p className="text-sm text-red-600">{errors.ifscCode.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      {...register("branchName")}
                      placeholder="Enter branch name"
                    />
                    {errors.branchName && (
                      <p className="text-sm text-red-600">{errors.branchName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select onValueChange={(value) => setValue("accountType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.accountType && (
                      <p className="text-sm text-red-600">{errors.accountType.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="balance">Account Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      {...register("balance", { valueAsNumber: true })}
                      placeholder="Enter account balance"
                    />
                    {errors.balance && (
                      <p className="text-sm text-red-600">{errors.balance.message}</p>
                    )}
                  </div>
                </div>
              </div>



              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Registering..." : "Register User"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}