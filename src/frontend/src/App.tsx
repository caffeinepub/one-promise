import { useInternetIdentity } from './hooks/useInternetIdentity';
import Onboarding from './pages/Onboarding';
import Today from './pages/Today';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  // Show loading state while checking for existing session
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F5F7]">
        <div className="text-center">
          <div className="animate-pulse text-[#2C2C2C]/60">Loading...</div>
        </div>
      </div>
    );
  }

  // Show onboarding if not authenticated
  if (!identity) {
    return <Onboarding />;
  }

  // Show main app when authenticated
  return <Today />;
}
