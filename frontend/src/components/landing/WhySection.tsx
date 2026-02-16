import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { useRef } from "react";
import GlowBorder from "../ui/GlowBorder";
import "../ui/GlowBorder.css";

const WhySection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      <motion.div style={{ y: bgY }} className="absolute inset-0 gradient-radial pointer-events-none" />
      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <ScrollReveal>
              <p className="mono text-xs text-primary tracking-widest uppercase mb-4">
                Why Veren
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="heading-lg mb-6">
                Deployments should be{" "}
                <span className="text-muted-foreground">invisible.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="body-lg">
                Manual deployment processes are error-prone, slow, and don't
                scale. Veren replaces fragile scripts and complex CI/CD
                configurations with a purpose-built deployment platform.
              </p>
            </ScrollReveal>
          </div>

          <div className="space-y-6">
            <ScrollReveal delay={0.15}>
              <GlowBorder>
                <div className="glass-card p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive text-sm font-bold">✕</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">The old way</h4>
                      <p className="body-md">
                        Manual scripts, brittle pipelines, complex YAML configs,
                        hours debugging infrastructure instead of building product.
                      </p>
                    </div>
                  </div>
                </div>
              </GlowBorder>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <GlowBorder>
                <div className="glass-card-hover p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">The Veren way</h4>
                      <p className="body-md">
                        Push code, Veren handles the rest. Automated builds,
                        instant deployments, full observability, zero config.
                      </p>
                    </div>
                  </div>
                </div>
              </GlowBorder>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
