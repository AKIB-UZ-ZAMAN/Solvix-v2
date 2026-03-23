export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  ...props 
}) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.02] shadow-lg shadow-primary/30 focus:ring-primary/50',
    secondary: 'bg-card text-text-primary border border-subtle hover:bg-dark-hover focus:ring-primary/50',
    accent: 'bg-gradient-to-r from-accent to-purple-600 text-white hover:scale-[1.02] shadow-lg shadow-accent/30 focus:ring-accent/50',
    ghost: 'bg-transparent text-text-secondary hover:bg-card hover:text-text-primary focus:ring-gray-500/50',
    success: 'bg-gradient-to-r from-success to-emerald-500 text-white hover:scale-[1.02] focus:ring-success/50',
    error: 'bg-gradient-to-r from-error to-red-500 text-white hover:scale-[1.02] focus:ring-error/50',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
    xl: 'px-9 py-4 text-xl',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '', hover = true, selected = false, ...props }) {
  return (
    <div
      className={`bg-card border border-subtle rounded-2xl shadow-xl ${hover ? 'hover:border-subtle-hover hover:bg-card-hover' : ''} transition-all duration-300 ${selected ? 'border-primary shadow-lg shadow-primary/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ value, max = 100, className = '', showLabel = false }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-text-secondary mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-card rounded-full overflow-hidden border border-subtle">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-card text-text-secondary border border-subtle',
    primary: 'bg-primary/20 text-primary border border-primary/30',
    success: 'bg-success/20 text-success border border-success/30',
    error: 'bg-error/20 text-error border border-error/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    info: 'bg-info/20 text-info border border-info/30',
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
  ];
  const colorIndex = name?.charCodeAt(0) % colors.length || 0;
  
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold shadow-lg ${className}`}>
      {initials}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-subtle rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto animate-scale-in">
        {title && (
          <div className="sticky top-0 bg-card border-b border-subtle px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-card border border-subtle rounded ${className}`} />
  );
}

export function Toast({ message, type = 'info', onClose }) {
  const types = {
    info: 'bg-primary',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
  };
  
  return (
    <div className={`fixed bottom-4 right-4 ${types[type]} text-white px-6 py-3 rounded-xl shadow-xl animate-slide-up flex items-center gap-3 z-50`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-75">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function Tooltip({ children, content, position = 'top' }) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${positions[position]} px-3 py-2 bg-card border border-subtle text-text-primary text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap shadow-xl`}>
        {content}
      </div>
    </div>
  );
}

export function Divider({ className = '' }) {
  return <div className={`h-px bg-subtle my-4 ${className}`} />;
}
