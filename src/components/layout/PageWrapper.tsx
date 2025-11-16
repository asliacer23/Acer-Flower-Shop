import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ChatWidget } from '../chat/ChatWidget';

interface PageWrapperProps {
  children: ReactNode;
}

export const PageWrapper = ({ children }: PageWrapperProps) => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      
      {/* Chat Widget for authenticated users (non-admin) */}
      {user && user.role !== 'admin' && (
        <ChatWidget userId={user.id} userName={user.name} />
      )}
    </motion.div>
  );
};
