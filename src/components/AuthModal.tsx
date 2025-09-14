import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabaseClient";
import { toast } from "@/components/ui/sonner";
import { AuthError } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { loginSchema, signupSchema, forgotPasswordSchema, type LoginFormData, type SignupFormData, type ForgotPasswordFormData } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (ownerId: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const form = useForm<LoginFormData | SignupFormData | ForgotPasswordFormData>({
    resolver: zodResolver(isForgotPassword ? forgotPasswordSchema : isLogin ? loginSchema : signupSchema),
  });

  const navigateToLanding = () => {
    onClose();
    navigate("/");
  };

  const onSubmit = async (data: LoginFormData | SignupFormData | ForgotPasswordFormData) => {
    setIsLoading(true);
    
    if (isForgotPassword) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent! Check your inbox.");
        setIsForgotPassword(false);
      } catch (err) {
        console.error("Forgot password error:", err);
        toast.error("Failed to send reset email. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else if (isLogin) {
      const loginData = data as LoginFormData;
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password,
        });

        if (error) throw error;

        if (authData.user) {
          const { data: ownerData } = await supabase
            .from("shop_owners")
            .select("id")
            .eq("user_id", authData.user.id)
            .single();

          if (ownerData) {
            onLoginSuccess(ownerData.id);
            toast.success("Login successful!");
            onClose();
            navigate("/dashboard");
          } else {
            toast.warning("No shop owner profile found. Please create one.");
          }
        }
      } catch (err) {
        console.error("Login error:", err);
        toast.error("Login failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      const signupData = data as SignupFormData;
      try {
        const { data: authData, error } = await supabase.auth.signUp({ 
          email: signupData.email, 
          password: signupData.password 
        });

        if (error) throw error;

        if (authData.user) {
          const { error: insertError } = await supabase.from("shop_owners").insert({
            user_id: authData.user.id,
          });

          if (insertError) {
            console.error("Error creating shop owner profile:", insertError);
            toast.error("Signup failed to create shop owner profile.");
            return;
          }

          toast.success("Signup successful! Please check your email for verification.");
          setIsLogin(true);
        }
      } catch (err) {
        const error = err as AuthError;
        if (error?.message?.includes("User already registered")) {
          toast.info("User already registered. Please log in instead.");
          setIsLogin(true);
        } else {
          console.error("Signup error:", error);
          toast.error("Signup failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden border border-gray-200">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-playfair font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back!" : "Join DressTracker"}
          </h2>
          <p className="text-gray-600 text-sm mt-2 text-center">
            {isForgotPassword 
              ? "Enter your email to receive a reset link" 
              : isLogin 
                ? "Sign in to manage your boutique" 
                : "Start your fashion journey today"
            }
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                        className="pl-10 rounded-lg border-gray-300 focus:border-primary"
                        disabled={isLoading}
                      />
                      <svg 
                        className="absolute left-3 top-3 w-4 h-4 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isForgotPassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 rounded-lg border-gray-300 focus:border-primary"
                          disabled={isLoading}
                        />
                        <svg 
                          className="absolute left-3 top-3 w-4 h-4 text-gray-400" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Primary Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-2.5 rounded-lg font-semibold hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading 
                ? "Processing..." 
                : isForgotPassword 
                  ? "Send Reset Link" 
                  : isLogin 
                    ? "Sign In" 
                    : "Create Account"
              }
            </Button>

            {isLogin && !isForgotPassword && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Forgot your password?
                </Button>
              </div>
            )}
          </form>
        </Form>

        {/* Divider */}
        {!isForgotPassword && (
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        )}

        {/* Switch Form */}
        {!isForgotPassword && (
          <p className="text-center text-sm text-gray-600">
            {isLogin ? "New to DressTracker?" : "Already have an account?"}{" "}
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 font-semibold p-0 h-auto"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </Button>
          </p>
        )}

        {isForgotPassword && (
          <p className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Button
              variant="link"
              onClick={() => setIsForgotPassword(false)}
              className="text-primary hover:text-primary/80 font-semibold p-0 h-auto"
            >
              Back to Login
            </Button>
          </p>
        )}

        {/* Button to navigate to Landing page */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={navigateToLanding}
            className="text-gray-600 hover:text-gray-800 font-medium text-sm"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;