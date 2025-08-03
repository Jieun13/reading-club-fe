import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text = '로딩 중...' }) => {
  const sizeClasses = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' },
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        className="animate-spin rounded-full border"
        style={{
          ...sizeClasses[size],
          borderWidth: '4px',
          borderColor: '#e5e7eb',
          borderTopColor: '#0284c7'
        }}
      ></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

export default Loading;
