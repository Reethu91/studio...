import Header from '@/components/layout/header';
import MainDashboard from '@/components/dashboard/main-dashboard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <MainDashboard />
      </main>
    </div>
  );
}
