import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  showLogo?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Chargement...",
  showLogo = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (showLogo) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <img
          src="/images/logo.png"
          alt="ByGagoos Ink"
          className="h-16 w-auto animate-pulse mb-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />
        {text && <span className="text-gray-600">{text}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
      ></div>
      {text && <span className="mt-3 text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;