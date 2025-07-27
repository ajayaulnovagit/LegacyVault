import { Link, useLocation } from "wouter";
import { Home, FolderOpen, Heart, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/assets", icon: FolderOpen, label: "Assets" },
    { href: "/wellbeing", icon: Heart, label: "Health" },
    { href: "/nominees", icon: User, label: "Contacts" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <button className={`flex flex-col items-center py-2 px-1 ${
                isActive ? "text-primary" : "text-gray-400"
              }`}>
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
