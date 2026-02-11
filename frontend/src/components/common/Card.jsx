const Card = ({ children, className = '', padding = true }) => {
  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;