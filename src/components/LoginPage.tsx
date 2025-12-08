import { useState } from "react";
import { School, User, Lock, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { useSchool } from "../contexts/SchoolContext";
import schoolLogo from "../assets/images/school-logo.jpg";

interface LoginPageProps {
  onLogin: (role: string) => void;
  onNavigateToLanding: () => void;
}

export function LoginPage({ onLogin, onNavigateToLanding }: LoginPageProps) {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useSchool();

  const handleLogin = async () => {
    if (!role || !username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = await login(username, password, role);
      
      if (user) {
        onLogin(role);
      } else {
        setError("Invalid username, password, or role");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && role && username && password) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#0d3558] to-[#0A2540] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div 
              onClick={onNavigateToLanding}
              className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-4 cursor-pointer hover:shadow-2xl transition-all hover:scale-110 shadow-xl p-2.5 ring-4 ring-[#FFD700]/30"
            >
              <img 
                src={schoolLogo} 
                alt="Graceland Royal Academy Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          <h1 className="text-3xl text-white mb-2">Graceland Royal Academy</h1>
          <p className="text-[#FFD700] italic">Wisdom & Illumination</p>
        </div>

        {/* Login Card */}
        <Card className="rounded-2xl shadow-2xl border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-white pb-6 pt-8">
            <h2 className="text-center text-[#0A2540]">Portal Login</h2>
            <p className="text-center text-gray-600 text-sm">Select your role and enter credentials</p>
          </CardHeader>
          
          <CardContent className="bg-white p-8 space-y-6" onKeyPress={handleKeyPress}>
            {/* Error Display */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#0A2540]">Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger 
                  id="role"
                  className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#FFD700] transition-colors"
                >
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="admin" className="rounded-lg">Admin</SelectItem>
                  <SelectItem value="teacher" className="rounded-lg">Teacher</SelectItem>
                  <SelectItem value="accountant" className="rounded-lg">Accountant</SelectItem>
                  <SelectItem value="parent" className="rounded-lg">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#0A2540]">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 pl-11 rounded-xl border-2 border-gray-200 focus:border-[#FFD700] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0A2540]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-11 rounded-xl border-2 border-gray-200 focus:border-[#FFD700] transition-colors"
                />
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!role || !username || !password || isLoading}
              className="w-full h-12 bg-[#FFD700] text-[#0A2540] hover:bg-[#FFD700]/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isLoading ? "Logging in..." : "Login to Portal"}
            </Button>

            {/* Back to Home */}
            <div className="text-center pt-4">
              <button
                onClick={onNavigateToLanding}
                className="text-sm text-[#0A2540] hover:text-[#FFD700] transition-colors hover:underline"
              >
                ← Back to Home
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-white/60 text-sm mt-6">
          Secure login portal for authorized users only
        </p>
      </div>
    </div>
  );
}