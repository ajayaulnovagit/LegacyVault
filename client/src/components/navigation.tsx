import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/assets", label: "Assets" },
    { href: "/wellbeing", label: "Well-being" },
    { href: "/nominees", label: "Nominees" },
  ];

  // Add admin link for admin users
  if (user?.email === 'admin@secureestate.com') {
    navItems.push({ href: "/admin", label: "Admin" });
  }

  const getWellbeingStatus = () => {
    if (!user) return { color: "text-gray-500", label: "Unknown" };
    
    if (user.alertCounter === 0) {
      return { color: "text-green-600", label: "Active" };
    } else if (user.alertCounter < user.maxAlerts) {
      return { color: "text-yellow-600", label: "Pending" };
    } else {
      return { color: "text-red-600", label: "Critical" };
    }
  };

  const status = getWellbeingStatus();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gray-900">SecureEstate</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={`transition-colors pb-4 -mb-4 ${
                  location === item.href
                    ? "text-primary font-medium border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Well-being Status Indicator */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
              <div className={`w-2 h-2 ${status.color.replace('text-', 'bg-')} rounded-full ${
                status.label === 'Active' ? 'animate-pulse' : ''
              }`}></div>
              <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email
                }
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
