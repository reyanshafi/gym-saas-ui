import "@fontsource-variable/inter";
import "./globals.css";
import "./_styles/management.css";
import "./_styles/gym-dashboard.css";

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
