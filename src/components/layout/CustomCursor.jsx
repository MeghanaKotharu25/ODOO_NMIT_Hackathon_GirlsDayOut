import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

export function CustomCursor() {
  const [cursorVariant, setCursorVariant] = useState('default');
  
  // Motion values for the dot (snappy)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Springs for the outline (smooth follow)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 4); // Center 8x8 dot
      cursorY.set(e.clientY - 4);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.closest('.roster-card')) {
        setCursorVariant('view');
      } else if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setCursorVariant('hover');
      } else {
        setCursorVariant('default');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const variants = {
    default: {
      width: 40,
      height: 40,
      x: -16, // offset to center (40/2 - 4)
      y: -16,
      backgroundColor: 'transparent',
      borderColor: 'var(--border-heavy)',
      mixBlendMode: 'normal'
    },
    hover: {
      width: 12,
      height: 12,
      x: -2,
      y: -2,
      backgroundColor: 'var(--text-primary)',
      borderColor: 'transparent',
      mixBlendMode: 'difference'
    },
    view: {
      width: 64,
      height: 64,
      x: -28,
      y: -28,
      backgroundColor: 'var(--bg-main)',
      borderColor: 'var(--text-primary)',
      mixBlendMode: 'normal'
    }
  };

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{
          translateX: cursorX,
          translateY: cursorY,
        }}
      />
      <motion.div
        className="cursor-outline"
        variants={variants}
        animate={cursorVariant}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
        }}
      >
        {cursorVariant === 'view' && <span className="cursor-text">VIEW</span>}
      </motion.div>
    </>
  );
}
