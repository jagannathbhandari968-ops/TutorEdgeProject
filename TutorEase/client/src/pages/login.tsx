import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Presentation, UserCheck, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleConfig = {
  admin: {
    icon: Settings,
    color: "border-gray-600 bg-gray-50",
    label: "Admin"
  },
  tutor: {
    icon: Presentation,
    color: "border-tutor bg-blue-50",
    label: "Tutor"
  },
  student: {
    icon: UserCheck,
    color: "border-student bg-green-50",
    label: "Student"
  },
  parent: {
    icon: Users,
    color: "border-parent bg-amber-50",
    label: "Parent"
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !selectedRole) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a role",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const success = await login(email, password, selectedRole);
    
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or role selection",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <GraduationCap className="text-white text-2xl h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EduManage</h1>
            <p className="text-gray-600 mt-2">Your complete tutoring management solution</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
                data-testid="input-email"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                data-testid="input-password"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">Login as:</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(roleConfig).map(([role, config]) => {
                  const IconComponent = config.icon;
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${
                        isSelected 
                          ? config.color 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      data-testid={`button-role-${role}`}
                    >
                      <IconComponent className={`mx-auto mb-2 h-5 w-5 ${
                        role === 'tutor' ? 'text-tutor' : 
                        role === 'student' ? 'text-student' : 'text-parent'
                      }`} />
                      <div className="text-sm font-medium">{config.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 hover:bg-primary/90"
              data-testid="button-login"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="#" className="text-primary hover:underline text-sm">
              Forgot password?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
