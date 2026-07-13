import { motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <FiLoader className={`${sizeClasses[size]} text-spotify-green`} />
      </motion.div>
      {text && <p className="text-spotify-light text-sm">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-square bg-spotify-gray rounded-lg mb-3" />
    <div className="h-4 bg-spotify-gray rounded w-3/4 mb-2" />
    <div className="h-3 bg-spotify-gray rounded w-1/2" />
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default LoadingSpinner;
