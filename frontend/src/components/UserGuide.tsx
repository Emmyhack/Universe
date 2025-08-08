import React, { useState, useEffect } from 'react';
import { X, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  route: string;
  action?: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'connect-wallet',
    title: 'Connect Your Wallet',
    description: 'First, connect your MetaMask wallet to participate in elections.',
    route: '/',
    action: 'Connect Wallet'
  },
  {
    id: 'view-dashboard',
    title: 'Explore Your Dashboard',
    description: 'Check your dashboard to see available elections and quick actions.',
    route: '/dashboard'
  },
  {
    id: 'browse-elections',
    title: 'Browse Elections',
    description: 'View all active elections and see which ones you can participate in.',
    route: '/elections'
  },
  {
    id: 'vote',
    title: 'Cast Your Vote',
    description: 'Select candidates and cast your vote securely and privately.',
    route: '/voting'
  }
];

interface UserGuideProps {
  isConnected: boolean;
  onClose?: () => void;
}

export const UserGuide = ({ isConnected, onClose }: UserGuideProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hasSeenGuideStorage = localStorage.getItem('univote-has-seen-guide');
    const hasSeenGuideValue = hasSeenGuideStorage === 'true';
    setHasSeenGuide(hasSeenGuideValue);

    // Show guide for new users
    if (!hasSeenGuideValue && !isConnected) {
      setIsVisible(true);
    }
  }, [isConnected]);

  useEffect(() => {
    // Update current step based on route and connection status
    if (!isConnected) {
      setCurrentStep(0);
    } else if (location.pathname === '/dashboard') {
      setCurrentStep(1);
    } else if (location.pathname === '/elections') {
      setCurrentStep(2);
    } else if (location.pathname.includes('/voting/')) {
      setCurrentStep(3);
    }
  }, [location.pathname, isConnected]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('univote-has-seen-guide', 'true');
    setHasSeenGuide(true);
    onClose?.();
  };

  const handleNextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const currentGuideStep = GUIDE_STEPS[currentStep];

  if (!isVisible || hasSeenGuide) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Getting Started</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
              Step {currentStep + 1} of {GUIDE_STEPS.length}
            </span>
            {currentStep > 0 && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-1">
              {currentGuideStep.title}
            </h4>
            <p className="text-sm text-gray-600">
              {currentGuideStep.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-1">
              {GUIDE_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleClose}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
              <button
                onClick={handleNextStep}
                className="btn-primary text-sm px-3 py-1 inline-flex items-center space-x-1"
              >
                <span>{currentStep === GUIDE_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                {currentStep < GUIDE_STEPS.length - 1 && (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HelpTooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpTooltip = ({ content, children, placement = 'top' }: HelpTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${
            placement === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
            placement === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
            placement === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' :
            'left-full ml-2 top-1/2 transform -translate-y-1/2'
          }`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              placement === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
              placement === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
              placement === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
              'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export const QuickStartBanner = ({ isConnected }: { isConnected: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('univote-has-seen-banner');
    if (!hasSeenBanner && location.pathname === '/' && !isConnected) {
      setIsVisible(true);
    }
  }, [location.pathname, isConnected]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('univote-has-seen-banner', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
            <Info className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-900 mb-1">
              Welcome to UniVote!
            </h3>
            <p className="text-sm text-primary-800 mb-3">
              New to blockchain voting? Start by connecting your MetaMask wallet to participate in secure, transparent university elections.
            </p>
            <div className="flex space-x-2">
              <button className="btn-primary text-sm">
                Connect Wallet
              </button>
              <button 
                onClick={handleDismiss}
                className="text-sm text-primary-700 hover:text-primary-800"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-primary-400 hover:text-primary-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};