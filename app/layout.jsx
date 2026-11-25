import './globals.css';
import { AppProvider } from '../lib/store';
export const metadata = { title: 'AQUA HRMS | Employee Management', description: 'Offline demonstration of AQUA Innovations HRMS' };
export default function RootLayout({ children }) {
  return <html lang="en"><body><AppProvider>{children}</AppProvider></body></html>;
}
