import { AnimatePresence, motion } from "framer-motion";

const WaterTransition = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* THE MASK CONTAINER */}
          <motion.div
            className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden"
            // 1. Start: 0% (Hidden)
            // 2. End: 15% (The Tunnel Entrance - Matches next page)
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(15% at 50% 50%)" }}
            transition={{
              duration: 1.5,
              ease: [0.7, 0, 0.3, 1], // "Expo" ease
            }}
          >
            {/* THE TARGET IMAGE 
                We use the Arches image so it looks like we are looking into the portal.
            */}
            <div className="relative w-screen h-screen">
                <img
                  src="/images/image_59eec6.jpg" 
                  alt="Destination"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Optional: Dark overlay to make it look deep */}
                <div className="absolute inset-0 bg-black/40" />

                <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    <h1 className="text-white font-serif text-sm tracking-[0.5em] uppercase">
                        Loading...
                    </h1>
                </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WaterTransition;