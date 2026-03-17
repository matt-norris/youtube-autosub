import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "SubSync — YouTube Subscription Transfer",
  description:
    "Transfer your YouTube subscriptions between accounts instantly. Import from CSV or clone another channel's subscription list.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
