const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} border-2 border-primary-600 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner;