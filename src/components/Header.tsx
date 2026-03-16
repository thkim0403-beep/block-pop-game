import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  score: number;
  title?: string;
}

export default function Header({ score, title = '💥 블록 팡!' }: HeaderProps) {
  return (
    <div className="text-center mb-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        {title}
      </h1>
      <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-2 shadow-md">
        <span className="text-gray-500 text-sm font-medium">점수</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={score}
            initial={{ scale: 1.4, color: '#f59e0b' }}
            animate={{ scale: 1, color: '#1f2937' }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-2xl md:text-3xl font-bold"
          >
            {score.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
