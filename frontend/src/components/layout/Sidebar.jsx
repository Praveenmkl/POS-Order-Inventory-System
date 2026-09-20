import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  LogOut,
  X,
  Users as UsersIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import Logo from "@/components/common/Logo";

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { itemCount } = useCart();

  const userRoleUpper = user?.role ? String(user.role).toUpperCase() : "";
  const isAdmin = userRoleUpper === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? "/admin/login" : "/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const allNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", adminOnly: true },
    { label: "POS Terminal", icon: ShoppingCart, path: "/pos", badge: itemCount > 0 ? itemCount : null },
    { label: isAdmin ? "Orders" : "My Orders", icon: ClipboardList, path: isAdmin ? "/admin/orders" : "/orders" },
    { label: "Products", icon: Package, path: "/admin/products", adminOnly: true },
    { label: "Cashier Management", icon: UsersIcon, path: "/admin/cashiers", adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);


  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background shadow-lg lg:shadow-none">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between px-6">
        <Logo size="md" />
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${isActive
                  ? "bg-black text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : ""}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[11px] font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2 p-3 border-t">
        {/* User info */}
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-zinc-100 text-zinc-800 text-xs font-semibold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || "Staff"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;