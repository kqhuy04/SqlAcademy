import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

interface AnimatedPageProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({
  children,
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
