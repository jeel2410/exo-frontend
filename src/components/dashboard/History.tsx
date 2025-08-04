import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Typography from "../../lib/components/atoms/Typography";
import { ToggleDownIcon, ToggleLeftIcon, VerticalIcon } from "../../icons";

export interface HistoryItem {
  id: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  isExpanded?: boolean;
}

interface HistoryProps {
  items: HistoryItem[];
}

const History: React.FC<HistoryProps> = ({ items }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      className="w-full mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`relative ${index !== items.length - 1 ? "pb-2" : ""}`}
          >
            {index !== items.length - 1 && (
              <motion.div
                className="absolute left-[22px] top-8 bottom-0 w-0.5 bg-gray-200"
                style={{ transform: "translateX(-50%)" }}
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              />
            )}

            <motion.div
              className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                expandedItems.includes(item.id) ? "border-l-2 border-blue" : ""
              }`}
              onClick={() => toggleItem(item.id)}
              whileHover={{ backgroundColor: "#f7fafc" }}
            >
              <motion.div
                className="flex-shrink-0 z-10"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-5 h-5 bg-white flex items-center justify-center rounded-full">
                  <AnimatePresence mode="wait">
                    {expandedItems.includes(item.id) ? (
                      <motion.div
                        key="down"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ToggleDownIcon className="w-4 h-4 text-blue" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="left"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ToggleLeftIcon className="w-4 h-4 text-gray-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <div className="flex-grow">
                <div className="flex items-center gap-1 mb-1">
                  <Typography
                    size="sm"
                    weight="semibold"
                    className="text-secondary-100"
                  >
                    {item.date}
                  </Typography>
                  <VerticalIcon />
                  <Typography
                    size="sm"
                    weight="semibold"
                    className="text-secondary-100"
                  >
                    {item.time}
                  </Typography>
                </div>
                <div>
                  <Typography
                    size="sm"
                    weight="semibold"
                    className="text-secondary-60 "
                  >
                    {item.title}
                  </Typography>
                </div>
                <AnimatePresence>
                  {expandedItems.includes(item.id) && item.description && (
                    <motion.div
                      className="mt-1"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <Typography
                        size="xs"
                        className="text-gray-500 border-gray-200 bg-secondary-10 py-2 pl-3 rounded-sm"
                      >
{item.description ? item.description.split('\n').map((line, index) => (
                            <span key={index}>{line}<br /></span>
                          )) : ''}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default History;
