import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const AlertCircleIcon = getIcon('AlertCircle');
const HomeIcon = getIcon('Home');

function NotFound() {
  return (
    <motion.div 
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-24 h-24 mb-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
        <AlertCircleIcon className="w-12 h-12 text-secondary" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-surface-600 dark:text-surface-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/" className="btn btn-primary flex items-center gap-2">
        <HomeIcon className="w-5 h-5" />
        <span>Go Home</span>
      </Link>
    </motion.div>
  );
}

export default NotFound;