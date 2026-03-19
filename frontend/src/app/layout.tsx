import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'BookLeaf - Author Support Portal',
  description: 'Manage your books and support queries with ease.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
