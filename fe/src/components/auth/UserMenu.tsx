import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuth.stores";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function UserMenu() {
  const navigate = useNavigate();
  const data = useAuthStore((s) => s.data);
  const setData = useAuthStore((s) => s.setData);

  const initials =
    (data?.name || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token"); // nếu bạn có lưu token riêng
    setData(null);
    toast({ title: "Đã đăng xuất" });
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-full p-1 hover:bg-muted transition"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={data?.avatarUrl} alt={data?.name || "User"} />
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserIcon className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">{data?.name || "Người dùng"}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Thêm các mục khác nếu muốn */}
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
