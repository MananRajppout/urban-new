import ProtectRoute from "@/components/admin/ProtectRoute";

export const metadata = {
  title: "Super Admin",
  description: "Super Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ProtectRoute>
          <main>{children}</main>
        </ProtectRoute>
      </body>
    </html>
  );
}
