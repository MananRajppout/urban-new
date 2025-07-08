import "@/styles/tailwind.css";
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectRoute from "@/components/admin/ProtectRoute";


export default function AdminRootLayout({ children }) {
  return   <ProtectRoute><AdminLayout>{children}</AdminLayout></ProtectRoute>;
}
