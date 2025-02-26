'use client';

import { useAuthStore } from '@/store/auth-store';
import RequireAuth from '@/components/auth/require-auth';
import SignOutButton from '@/components/auth/sign-out-button';

const DashboardPage = () => {
  const { user } = useAuthStore();

  console.log('[dashboard] user: ', user);

  return (
    <RequireAuth>
      <div className="py-10 custom_container">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, {user?.name || user?.email}</p>
        {/* Add your dashboard content here */}
        <SignOutButton />
      </div>

    </RequireAuth>
  );
}

export default DashboardPage;