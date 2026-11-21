import "@fontsource-variable/inter";
import "./globals.css";
import "@/shared/styles/management.css";
import "@/features/records/record-form-drawer.css";
import "@/features/dashboard/gym-dashboard.css";

export const metadata = {
  title: { default: "GymSaas", template: "%s · GymSaas" },
  description: "Gym and platform management workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
