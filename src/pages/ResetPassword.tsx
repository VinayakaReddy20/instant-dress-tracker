import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { passwordSchema } from "@/lib/validations";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handlePasswordReset = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          toast({
            title: "Error",
            description: "Invalid or expired reset link.",
            variant: "destructive",
          });
          navigate("/");
        } else {
          setSessionSet(true);
        }
      } else {
        toast({
          title: "Error",
          description: "No reset token found in URL.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    handlePasswordReset();
  }, [navigate, toast]);

  const handleUpdatePassword = async () => {
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
        description: "You can now log in with your new password.",
      });
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
