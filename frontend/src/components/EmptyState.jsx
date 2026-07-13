import { motion } from "framer-motion";
import { FiMusic } from "react-icons/fi";

const EmptyState = ({
  icon: Icon = FiMusic,
  title = "Nothing here yet",
  description = "Start exploring to find something you love.",
  action = null
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-spotify-gray flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-spotify-light" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-spotify-light max-w-md mb-6">{description}</p>
    {action}
  </motion.div>
);

export default EmptyState;
