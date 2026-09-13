import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getTitle = () => {
    const path = location.pathname.replace("/", "");
    if (!path) return "Dashboard";
    if (path === "pos") return "Point of Sale";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-background">
      <div>
        <h2 className="text-lg font-semibold">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium leading-none">{user?.name || "Cashier"}</p>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            {user?.role || "Staff"}
          </p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;