import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Suspense, lazy, useRef } from "react";

const HeroScene = lazy(() => import("./HeroScene"));

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      <div className="absolute inset-0 gradient-radial pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 section-container text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
        >
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium mono text-muted-foreground">
            Deployment infrastructure, automated
          </span>
        </motion.div>

        <h1 className="heading-xl mb-6">
          {["Deploy", "with"].map((word, i) => (
            <motion.span key={word} custom={i} variants={wordVariants} initial="hidden" animate="visible" className="inline-block mr-[0.3em]">
              {word}
            </motion.span>
          ))}
          <br />
          <motion.span custom={2} variants={wordVariants} initial="hidden" animate="visible" className="glow-text inline-block">
            confidence.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="body-lg max-w-xl mx-auto mb-10"
        >
          Veren automates your build pipelines and infrastructure orchestration.
          Push code, deploy everywhere.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#cta"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#architecture"
            className="flex items-center gap-2 px-8 py-3.5 rounded-full glass-card text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
          >
            View Architecture
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
