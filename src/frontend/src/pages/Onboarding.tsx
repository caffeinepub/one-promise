import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const carouselSlides = [
  {
    image: '/assets/generated/zen-stones.dim_1200x800.png',
    text: 'Small promises, big changes.',
  },
  {
    image: '/assets/generated/full-sun.dim_1200x800.png',
    text: 'One promise a day.',
  },
  {
    image: '/assets/generated/crescent-moon.dim_1200x800.png',
    text: 'A moment for you.',
  },
];

export default function Onboarding() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';

  // Trigger fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // If user becomes authenticated while on this screen, they'll be redirected by App.tsx
  useEffect(() => {
    if (identity) {
      // Navigation handled by App.tsx
    }
  }, [identity]);

  const handleGetStarted = async () => {
    if (identity) {
      // Already authenticated, App.tsx will handle navigation
      return;
    }
    
    try {
      await login();
      // On success, App.tsx will automatically show Today screen
    } catch (error) {
      console.error('Login failed:', error);
      // User stays on onboarding and can retry
    }
  };

  const handleLearnMore = () => {
    setShowCarousel(true);
    setCurrentSlide(0);
  };

  const handleNext = () => {
    if (currentSlide < carouselSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleStartJourney = async () => {
    await handleGetStarted();
  };

  if (showCarousel) {
    return (
      <div className="min-h-screen bg-[#F2F5F7] flex flex-col items-center justify-center px-6 py-12 transition-opacity duration-500">
        <div className="w-full max-w-2xl mx-auto text-center space-y-12">
          {/* Brand */}
          <h1 className="font-serif text-5xl md:text-6xl text-[#2C2C2C] tracking-tight">
            One Promise
          </h1>

          {/* Carousel Content */}
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="w-full max-w-md mx-auto aspect-[3/2] flex items-center justify-center">
              <img
                src={carouselSlides[currentSlide].image}
                alt=""
                className="w-full h-full object-contain opacity-60"
              />
            </div>
            <p className="text-2xl md:text-3xl text-[#2C2C2C]/80 font-light">
              {carouselSlides[currentSlide].text}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="text-[#2C2C2C] hover:bg-[#2C2C2C]/5 disabled:opacity-30"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex gap-2">
              {carouselSlides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-[#2C2C2C]'
                      : 'w-2 bg-[#2C2C2C]/20'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentSlide === carouselSlides.length - 1}
              className="text-[#2C2C2C] hover:bg-[#2C2C2C]/5 disabled:opacity-30"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Button
              onClick={handleStartJourney}
              disabled={isLoggingIn}
              className="px-12 py-6 text-lg bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white rounded-full transition-all duration-300"
            >
              {isLoggingIn ? 'Connecting...' : 'Start My Journey'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#F2F5F7] flex flex-col items-center justify-center px-6 py-12 transition-opacity duration-700 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full max-w-2xl mx-auto text-center space-y-16">
        {/* Brand */}
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="font-serif text-6xl md:text-7xl text-[#2C2C2C] tracking-tight">
            One Promise
          </h1>
          <p className="text-xl md:text-2xl text-[#2C2C2C]/60 font-light">
            A moment of intention, every day
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Button
            onClick={handleGetStarted}
            disabled={isLoggingIn}
            className="px-12 py-6 text-lg bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white rounded-full transition-all duration-300 shadow-sm"
          >
            {isLoggingIn ? 'Connecting...' : 'Get Started'}
          </Button>

          <div>
            <button
              onClick={handleLearnMore}
              disabled={isLoggingIn}
              className="text-[#2C2C2C]/60 hover:text-[#2C2C2C] transition-colors duration-300 underline underline-offset-4 disabled:opacity-50"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
