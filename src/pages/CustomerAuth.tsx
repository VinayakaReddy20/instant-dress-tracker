import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CustomerAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if user is a customer
        const { data: customerData } = await supabase
          .from("customers")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();

        if (!customerData) {
          toast({
            title: "Error",
            description: "This account is not registered as a customer.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Login successful!",
        });
        navigate("/");
      } else {
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (authData.user) {
          // Insert into customers table
          const { error: insertError } = await supabase
            .from("customers")
            .insert({
              user_id: authData.user.id,
              email,
              full_name: fullName,
              phone,
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

          if (insertError) throw insertError;

          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify.",
          });
          navigate("/");
        }
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast({
          title: "Error",
          description: err.message || "An error occurred",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Check if already a customer
        supabase
          .from("customers")
          .select("*")
          .eq("user_id", data.session.user.id)
          .single()
          .then(({ data: customer }) => {
            if (customer) navigate("/");
          });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-8 bg-white rounded-2xl shadow-lg w-96 space-y-4">
        <h2 className="text-2xl font-bold">{isLogin ? "Customer Login" : "Customer Sign Up"}</h2>
        {!isLogin && (
          <>
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>
        )}
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleAuth} className="w-full" disabled={loading}>
          {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
        </Button>
        <p className="text-sm text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
        {isLogin && (
          <p className="text-sm text-center">
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Back to Home
            </span>
          </p>
        )}
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

export default CustomerAuth;
