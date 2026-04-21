import './globals.css';

export const metadata = {
  title: 'Home CMMS',
  description: 'Keep your home running smoothly with scheduled maintenance tracking for HVAC, water heaters, and pools.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
