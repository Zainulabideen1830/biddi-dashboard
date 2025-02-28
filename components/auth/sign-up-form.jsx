"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth-store";

const FormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Invalid email address.",
    }),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 characters.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const SignUpForm = ({ token }) => {
  const { setUser } = useAuthStore();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0 && showVerification) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, showVerification]);

  // Handle token verification on component mount
  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${token}`,
          {
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        // Update auth store with user data
        setUser(data.user);
        setIsVerified(true);
        toast.success('Email verified successfully!');

        // Redirect to company info page after a short delay
        setTimeout(() => {
          router.push('/auth/company-info');
        }, 1000);

      } catch (error) {
        toast.error(error.message || 'Verification failed');
        console.error('Verification error:', error);
      }
    };

    // Check for verification token in URL
    if (token) {
      verifyToken(token);
    }
  }, [token, router]);

  async function resend() {
    try {
      setIsResending(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      setCountdown(60); // Reset countdown
      toast.success("A new verification email has been sent to your inbox.");
    } catch (error) {
      toast.error(
        error.message || "Something went wrong. Please try again later."
      );
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(data) {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Accept': 'application/json',
            // 'Access-Control-Allow-Credentials': 'true'
          },
          credentials: "include",
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      // Set email for verification UI
      setUserEmail(data.email);
      setVerificationUrl(result.verificationUrl);
      // Show verification UI
      setShowVerification(true);
      setCountdown(60);
      toast.success(
        "Account created successfully! Please check your email for verification."
      );
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerified) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Email Verified!</h2>
          <p className="text-muted-foreground">
            Redirecting you to the dashboard...
          </p>
        </div>
        <Loader2 className="animate-spin mx-auto" />
      </div>
    );
  }
  if (showVerification) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            {verificationUrl && (
              <div className="text-sm mb-5">

                <Link
                  href={verificationUrl}
                  // target="_blank"
                  className="text-red-700 hover:underline mb-9 italic"
                >
                  During the development phase, please click here to verify your
                  email
                </Link>
              </div>
            )}
            <p className="text-sm text-blue-700">
              A verification email has been sent to <strong>{userEmail}</strong>
              . Please check your inbox and click the verification link.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Haven't received the email? You can resend it
            {countdown > 0 ? ` in ${countdown} seconds` : " now"}.
          </p>
        </div>
        <Button
          onClick={resend}
          disabled={isResending || countdown > 0}
          className="w-full"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending verification email...
            </>
          ) : countdown > 0 ? (
            `Resend available in ${countdown}s`
          ) : (
            "Resend Verification Email"
          )}
        </Button>
        <div className="text-sm text-center space-y-2">
          <p className="text-muted-foreground">
            Make sure to check your spam folder if you don't see the email.
          </p>
          <Link
            href="/auth/sign-in"
            className="text-primary hover:underline block"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 3xl:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary">
            Sign In
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
