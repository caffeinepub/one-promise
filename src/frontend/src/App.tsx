import { useInternetIdentity } from './hooks/useInternetIdentity';
import Onboarding from './pages/Onboarding';
import Today from './pages/Today';
import { consumePostLogoutFlag } from './utils/onboardingEntry';

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
    // Check if this is immediately after logout
    const showLoggedOutScreen = consumePostLogoutFlag();
    // Start at slide 0 (landing) only after logout, otherwise start at slide 1 (first carousel content)
    const initialSlide = showLoggedOutScreen ? 0 : 1;
    return <Onboarding key={`onboarding-${initialSlide}`} initialSlide={initialSlide} />;
  }

  // Show main app when authenticated
  return <Today />;
}
