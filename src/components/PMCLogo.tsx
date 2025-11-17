import { Trophy } from 'lucide-react';

interface PMCLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export default function PMCLogo({ size = 'md', showText = true, variant = 'light' }: PMCLogoProps) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const iconColors = {
    light: 'text-pmc-gold-500',
    dark: 'text-pmc-green-500',
  };

  const textColors = {
    light: 'text-white',
    dark: 'text-pmc-green-700',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`absolute inset-0 ${iconColors[variant]} opacity-20 blur-md`}>
          <Trophy size={iconSizes[size]} />
        </div>
        <Trophy size={iconSizes[size]} className={iconColors[variant]} />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-display font-bold ${textSizes[size]} ${textColors[variant]}`}>
            PMC
          </span>
          <span className={`text-xs font-medium ${variant === 'light' ? 'text-pmc-gold-400' : 'text-pmc-green-600'} uppercase tracking-wider`}>
            Tactical Optimizer
          </span>
        </div>
      )}
    </div>
  );
}
