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
import { useApi } from "@/lib/api";

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

const SignUpForm = ({ token, invitation }) => {
  const { setUser, initAuth } = useAuthStore();
  const api = useApi();
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [isCheckingInvitation, setIsCheckingInvitation] = useState(false);
  const [isInvitationSuccess, setIsInvitationSuccess] = useState(false);

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

  // Handle invitation verification on component mount
  useEffect(() => {
    const verifyInvitation = async (invitationToken) => {
      try {
        setIsCheckingInvitation(true);

        const result = await api.get(`/api/auth/verify-invitation?token=${invitationToken}`);

        if (result.success) {
          setInvitationDetails(result.data);
          // Pre-fill the email field with the invited email
          form.setValue('email', result.data.email);
          setIsInvitationSuccess(true);
        } else {
          throw new Error(result.message || 'Invalid invitation');
        }
      } catch (error) {
        toast.error(error.message || 'Invalid invitation');
        console.error('Invitation verification error:', error);
      } finally {
        setIsCheckingInvitation(false);
      }
    };

    // Check for invitation token
    if (invitation) {
      verifyInvitation(invitation);
    }
  }, [invitation, form]);


  // Handle token verification on component mount
  useEffect(() => {
    const verifyToken = async (token) => {
      try {
        setIsVerifying(true);

        // Use POST request for verifying email tokens
        const result = await api.post('/api/auth/verify-email', { token });

        if (result.success) {
          // Update auth store with user data and tokens
          initAuth(result.user, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          });

          setIsVerified(true);
          toast.success('Email verified successfully!');

          // Redirect to company info page after a short delay
          setTimeout(() => {
            router.push('/auth/company-info');
          }, 1000);
        } else {
          throw new Error(result.message || 'Verification failed');
        }
      } catch (error) {
        toast.error(error.message || 'Verification failed');
        console.error('Verification error:', error);
      } finally {
        setIsVerifying(false);
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

      const result = await api.post('/api/auth/resend-verification', {
        email: userEmail
      });

      if (result.success) {
        setCountdown(60); // Reset countdown
        toast.success("A new verification email has been sent to your inbox.");
        setVerificationUrl(result.verificationUrl);
      } else {
        throw new Error(result.message || "Failed to resend verification email");
      }
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

      // Handle invited user sign-up
      if (invitation && invitationDetails) {
        const result = await api.post('/api/auth/accept-invitation', {
          token: invitation,
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
        });

        if (result.success) {
          // Update auth store with user data and tokens
          initAuth(result.user, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          });

          toast.success('Account created successfully! Redirecting to dashboard...');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          throw new Error(result.message || 'Failed to create account');
        }
      } else {
        // Handle regular user sign-up
        const result = await api.post('/api/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
        });

        if (result.success) {
          // Set email for verification UI
          setUserEmail(data.email);
          setVerificationUrl(result.verificationUrl);

          // Show verification UI
          setShowVerification(true);
          setCountdown(60);

          toast.success(
            "Account created successfully! Please check your email for verification."
          );
        } else {
          throw new Error(result.message || "Failed to create account");
        }
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Show verification status if token is present
  if (isVerifying || isVerified) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{isVerified ? "Email Verified!" : "Verifying Email..."}</h2>
          <p className="text-muted-foreground">
            {isVerified ? "Redirecting you to the company info page..." : "Please wait while we verify your email..."}
          </p>
        </div>
        <Loader2 className="animate-spin mx-auto h-8 w-8" />
      </div>
    );
  }

  // Show loading state while checking invitation
  if (isCheckingInvitation || isInvitationSuccess) {
    return (
      <div className="space-y-6">
        {isCheckingInvitation && (
          <div className="space-y-2 text-center">
            <h2 className="text-sm 2xl:text-base font-semibold">Verifying Invitation...</h2>
            <p className="text-muted-foreground">
              Please wait while we verify your invitation...
            </p>
            <Loader2 className="animate-spin mx-auto h-8 w-8" />
          </div>
        )}

        {isInvitationSuccess && (
          <>
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <p className="text-green-800 text-sm font-medium">
                Invitation verified successfully!
              </p>
              <p className="text-green-700 text-sm mt-2">
                Please complete the form below to create your account.
              </p>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>{invitationDetails.inviter.name}</strong> has invited you to join <strong>{invitationDetails.company.business_name}</strong> as a <strong>{invitationDetails.role.name} role</strong>.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            className="bg-white"
                          />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            disabled={true} // Email is fixed for invited users
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            {...field}
                            disabled={isLoading}
                            className="bg-white"
                          />
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
                          <Input
                            type="password"
                            {...field}
                            disabled={isLoading}
                            className="bg-white"
                          />
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
                          <Input
                            type="password"
                            {...field}
                            disabled={isLoading}
                            className="bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full !mt-7" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-sm text-center">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="text-primary hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </>
        )}
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
              Resending...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show invitation sign-up form if invitation is valid
  // if (isInvitationSuccess) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
  //         <p className="text-sm text-blue-700">
  //           <strong>{invitationDetails.inviter.name}</strong> has invited you to join <strong>{invitationDetails.company.business_name}</strong> as a <strong>{invitationDetails.role.name} role</strong>.
  //         </p>
  //       </div>

  //       <Form {...form}>
  //         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
  //           <FormField
  //             control={form.control}
  //             name="name"
  //             render={({ field }) => (
  //               <FormItem>
  //                 <FormLabel>Full Name</FormLabel>
  //                 <FormControl>
  //                   <Input placeholder="John Doe" {...field} />
  //                 </FormControl>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />

  //           <FormField
  //             control={form.control}
  //             name="email"
  //             render={({ field }) => (
  //               <FormItem>
  //                 <FormLabel>Email</FormLabel>
  //                 <FormControl>
  //                   <Input 
  //                     type="email" 
  //                     placeholder="john@example.com" 
  //                     {...field} 
  //                     disabled={true} // Email is fixed for invited users
  //                   />
  //                 </FormControl>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />

  //           <FormField
  //             control={form.control}
  //             name="phone"
  //             render={({ field }) => (
  //               <FormItem>
  //                 <FormLabel>Phone Number</FormLabel>
  //                 <FormControl>
  //                   <Input placeholder="+1 (555) 000-0000" {...field} />
  //                 </FormControl>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />

  //           <FormField
  //             control={form.control}
  //             name="password"
  //             render={({ field }) => (
  //               <FormItem>
  //                 <FormLabel>Password</FormLabel>
  //                 <FormControl>
  //                   <Input type="password" {...field} />
  //                 </FormControl>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />

  //           <FormField
  //             control={form.control}
  //             name="confirmPassword"
  //             render={({ field }) => (
  //               <FormItem>
  //                 <FormLabel>Confirm Password</FormLabel>
  //                 <FormControl>
  //                   <Input type="password" {...field} />
  //                 </FormControl>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />

  //           <Button type="submit" className="w-full" disabled={isLoading}>
  //             {isLoading ? (
  //               <>
  //                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //                 Creating Account...
  //               </>
  //             ) : (
  //               "Create Account"
  //             )}
  //           </Button>
  //         </form>
  //       </Form>

  //       <div className="text-sm text-center">
  //         Already have an account?{" "}
  //         <Link href="/auth/sign-in" className="text-primary hover:underline">
  //           Sign In
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  className="bg-white"
                />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  disabled={isLoading}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  {...field}
                  disabled={isLoading}
                  className="bg-white"
                />
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
                <Input
                  type="password"
                  {...field}
                  disabled={isLoading}
                  className="bg-white"
                />
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
                <Input
                  type="password"
                  {...field}
                  disabled={isLoading}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
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
          <Link
            href="/auth/sign-in"
            className="text-primary hover:underline"
            tabIndex={isLoading ? -1 : 0}
          >
            Sign In
          </Link>
        </div>
      </form>
    </Form>
  );
}

export default SignUpForm;
