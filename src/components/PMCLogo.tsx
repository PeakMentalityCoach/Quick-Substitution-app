import { Trophy } from 'lucide-react';
import { PMC_BRAND_NAME, PMC_COLORS } from '../constants/brand';

interface PMCLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function PMCLogo({ size = 'md', showText = true }: PMCLogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-sm' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };

  const config = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-lg p-2 flex items-center justify-center"
        style={{ backgroundColor: PMC_COLORS.primary }}
      >
        <Trophy size={config.icon} color={PMC_COLORS.white} strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${config.text} font-bold leading-tight`}
            style={{ color: PMC_COLORS.secondary }}
          >
            PMC
          </span>
          <span className="text-xs text-gray-500 leading-tight">{PMC_BRAND_NAME}</span>
        </div>
      )}
    </div>
  );
}
