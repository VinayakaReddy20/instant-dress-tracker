import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { passwordSchema } from "@/lib/validations";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth state changes to detect when session is set from URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if this is a recovery session
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');

        if (type === 'recovery') {
          // Valid recovery session - show the reset form
          setSessionSet(true);
        } else {
          // Not a recovery session - redirect
          toast({
            title: "Error",
            description: "Invalid reset link.",
            variant: "destructive",
          });
          navigate("/");
        }
      }
    });

    // Also check current session immediately in case it's already set
    const checkCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get('type');
        if (type === 'recovery') {
          setSessionSet(true);
        }
      }
    };

    checkCurrentSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }

    const validation = passwordSchema.safeParse(newPassword);
    if (!validation.success) {
      toast({
        title: "Invalid Password",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully!",
        description: "You have been logged out. Please log in with your new password.",
      });

      // Log out the user
      await supabase.auth.signOut();

      // Redirect to home page for login
      navigate("/");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast({
          title: "Error",
          description: err.message || "Failed to update password.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update password.",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  };

  if (!sessionSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 bg-white rounded-2xl shadow-lg w-96 space-y-4">
          <h2 className="text-2xl font-bold">Verifying reset link...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-8 bg-white rounded-2xl shadow-lg w-96 space-y-4">
        <h2 className="text-2xl font-bold">Reset Your Password</h2>
        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button onClick={handleUpdatePassword} className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
        <p className="text-sm text-center">
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Back to Home
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
