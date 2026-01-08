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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();

  const form = useForm<LoginFormData | SignupFormData | ForgotPasswordFormData>({
    resolver: zodResolver(isForgotPassword ? forgotPasswordSchema : isLogin ? loginSchema : signupSchema),
  });

  const navigateToLanding = () => {
    onClose();
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      // The redirect will happen automatically, so we don't need to handle success here
    } catch (err) {
      console.error("Google sign-in error:", err);
      toast.error("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
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
          let { data: ownerData } = await supabase
            .from("shop_owners")
            .select("id")
            .eq("user_id", authData.user.id)
            .single();

          if (!ownerData) {
            // Create shop owner profile on first login
            const { data: newOwnerData, error: insertError } = await supabase
              .from("shop_owners")
              .insert({ user_id: authData.user.id })
              .select("id")
              .single();

            if (insertError) {
              console.error("Error creating shop owner profile:", insertError);
              toast.error("Failed to create shop owner profile.");
              return;
            }

            ownerData = newOwnerData;
          }

          onLoginSuccess(ownerData.id);
          toast.success("Login successful!");
          onClose();
          navigate("/dashboard");
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

        {/* Google Sign-In Button */}
        {!isForgotPassword && (
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Button>
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
