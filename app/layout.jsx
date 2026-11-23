import "@fontsource-variable/inter";
import "@/shared/styles/application.css";

export const metadata = {
  title: { default: "Gypptiro", template: "%s · Gypptiro" },
  description: "Gym and platform management workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
