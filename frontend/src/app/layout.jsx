
export const metadata = {
  title: "Super Admin",
  description: "Super Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      
          <main>{children}</main>
      </body>
    </html>
  );
}
