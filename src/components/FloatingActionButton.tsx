import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function FloatingActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
}: FloatingActionButtonProps) {
  const variants = {
    primary: 'from-pmc-green-600 to-pmc-green-500 hover:from-pmc-green-700 hover:to-pmc-green-600 shadow-pmc-green-300',
    secondary: 'from-pmc-gold-600 to-pmc-gold-500 hover:from-pmc-gold-700 hover:to-pmc-gold-600 shadow-pmc-gold-300',
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed bottom-8 right-8 z-30 flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r ${variants[variant]} text-white font-bold shadow-2xl hover:shadow-3xl transition-all group`}
      aria-label={label}
    >
      <Icon size={24} className="group-hover:rotate-12 transition-transform" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
