import "./globals.css";
import { PmsProvider } from "@/context/PmsContext";

export const metadata = {
  title: "CITYHOUSE PMS",
  description: "CITYHOUSE PMS Phase 1 Demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <PmsProvider>{children}</PmsProvider>
      </body>
    </html>
  );
}
