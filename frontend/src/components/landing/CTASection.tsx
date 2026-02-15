import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { ArrowRight, Github } from "lucide-react";
import { useRef } from "react";

const CTASection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section id="cta" ref={ref} className="py-32 relative overflow-hidden">
      <motion.div style={{ y: bgY }} className="absolute inset-0 gradient-radial-bottom pointer-events-none" />
      <div className="section-container relative z-10 text-center">
        <ScrollReveal>
          <h2 className="heading-lg mb-6">
            Ready to simplify
            <br />
            <span className="glow-text">your deployments?</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="body-lg max-w-lg mx-auto mb-10">
            Explore the architecture, contribute to the project, or start
            deploying with Veren today.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/atithi4dev/veren"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Github className="w-4 h-4" />
              View on GitHub
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#about"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Learn More
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
