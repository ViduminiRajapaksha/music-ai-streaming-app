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
    className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center"
  >
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-spotify-green/25 to-white/5 ring-1 ring-white/10">
      <Icon className="h-9 w-9 text-spotify-green" />
    </div>
    <h3 className="mb-2 text-xl font-bold">{title}</h3>
    <p className="mb-6 max-w-md text-spotify-light">{description}</p>
    {action}
  </motion.div>
);

export default EmptyState;
