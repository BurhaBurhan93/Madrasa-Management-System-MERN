import React from 'react';
import { 
  FiAlertCircle, 
  FiWifiOff, 
  FiServer, 
  FiLock, 
  FiSearch, 
  FiRefreshCw, 
  FiHome,
  FiArrowLeft,
  FiHelpCircle
} from 'react-icons/fi';

/**
 * ErrorPage Component - A comprehensive error handling UI component
 * 
 * Props:
 * - type: 'network' | 'server' | 'not-found' | 'forbidden' | 'generic'
 * - title: Custom error title
 * - message: Custom error message
 * - onRetry: Function to retry/reload
 * - onBack: Function to go back
 * - onHome: Function to go home
 * - showHomeButton: boolean - Show home button
 * - showBackButton: boolean - Show back button
 * - showRetryButton: boolean - Show retry button
 */

const ErrorPage = ({ 
  type = 'generic',
  title,
  message,
  onRetry,
  onBack,
  onHome,
  showHomeButton = true,
  showBackButton = true,
  showRetryButton = true
}) => {
  // Error configurations
  const errorConfigs = {
    network: {
      icon: FiWifiOff,
      defaultTitle: 'Connection Lost',
      defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      color: 'orange',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
      borderColor: 'border-orange-200'
    },
    server: {
      icon: FiServer,
      defaultTitle: 'Server Error',
      defaultMessage: 'Something went wrong on our end. Our team has been notified and we\'re working to fix it.',
      color: 'red',
      bgGradient: 'from-red-50 to-pink-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-500 hover:bg-red-600',
      borderColor: 'border-red-200'
    },
    'not-found': {
      icon: FiSearch,
      defaultTitle: 'Page Not Found',
      defaultMessage: 'The page you\'re looking for doesn\'t exist or has been moved.',
      color: 'blue',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      borderColor: 'border-blue-200'
    },
    forbidden: {
      icon: FiLock,
      defaultTitle: 'Access Denied',
      defaultMessage: 'You don\'t have permission to access this resource. Please contact your administrator.',
      color: 'purple',
      bgGradient: 'from-purple-50 to-violet-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
      borderColor: 'border-purple-200'
    },
    generic: {
      icon: FiAlertCircle,
      defaultTitle: 'Oops! Something went wrong',
      defaultMessage: 'An unexpected error occurred. Please try again later.',
      color: 'gray',
      bgGradient: 'from-gray-50 to-slate-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
      borderColor: 'border-gray-200'
    }
  };

  const config = errorConfigs[type];
  const IconComponent = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <div className={`min-h-[60vh] flex items-center justify-center p-4 bg-gradient-to-br ${config.bgGradient}`}>
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 p-8 text-center">
          {/* Animated Icon Container */}
          <div className="relative mb-6">
            {/* Pulse Effect */}
            <div className={`absolute inset-0 ${config.iconBg} rounded-full animate-ping opacity-20`}></div>
            {/* Icon Circle */}
            <div className={`relative ${config.iconBg} rounded-full p-6 inline-flex ${config.borderColor} border-2`}>
              <IconComponent className={`w-16 h-16 ${config.iconColor}`} />
            </div>
          </div>

          {/* Error Code Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 ${config.iconBg} rounded-full mb-4 ${config.borderColor} border`}>
            <span className={`text-sm font-semibold ${config.iconColor} uppercase tracking-wide`}>
              {type === 'network' ? 'Error 503' : 
               type === 'server' ? 'Error 500' :
               type === 'not-found' ? 'Error 404' :
               type === 'forbidden' ? 'Error 403' : 'Error'}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {displayTitle}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {displayMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetryButton && onRetry && (
              <button
                onClick={onRetry}
                className={`flex items-center justify-center gap-2 px-6 py-3 ${config.buttonColor} text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
              >
                <FiRefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            )}

            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            )}

            {showHomeButton && onHome && (
              <button
                onClick={onHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
              >
                <FiHome className="w-5 h-5" />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Contact support
          </p>
          <button 
            onClick={() => window.open('mailto:support@madrasa.edu', '_blank')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiHelpCircle className="w-4 h-4" />
            <span className="underline">support@madrasa.edu</span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full ${config.iconBg} opacity-50`}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
