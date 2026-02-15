import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { GitBranch, Server, Cog, Database, Rocket, ArrowRight } from "lucide-react";
import GlowBorder from "../ui/GlowBorder";
import "../ui/GlowBorder.css";

const steps = [
  { icon: GitBranch, label: "Source Repo", sublabel: "Git push" },
  { icon: Server, label: "API Gateway", sublabel: "Route & auth" },
  { icon: Cog, label: "Workers", sublabel: "Build & compile" },
  { icon: Database, label: "Storage", sublabel: "Artifacts" },
  { icon: Rocket, label: "Deploy", sublabel: "Live" },
];

const ArchitectureSection = () => {
  // Removed scroll-based background animation for static background

  return (
    <section id="architecture" className="pt-10 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 gradient-radial-bottom pointer-events-none" />
      <div className="section-container relative z-10">
        <ScrollReveal>
          <p className="mono text-xs text-primary tracking-widest uppercase mb-4">
            Architecture
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="heading-lg max-w-3xl mb-6">
            Cloud-native, <span className="text-muted-foreground">event-driven.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="body-lg max-w-2xl mb-20">
            Every deployment flows through a robust pipeline — from source to production in seconds.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <GlowBorder className="p-0">
            <div className="glass-card p-4 md:p-12">
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-2">
                {steps.map((step, i) => (
                  <React.Fragment key={step.label}>
                    <div className="flex items-center gap-2 flex-1">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i + 0.4, duration: 0.5 }}
                        className="flex flex-col items-center text-center flex-shrink-0"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3 border border-border">
                          <step.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{step.label}</span>
                        <span className="text-xs text-muted-foreground mt-1">{step.sublabel}</span>
                      </motion.div>
                    </div>
                    {i < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        whileInView={{ opacity: 1, scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i + 0.6, duration: 0.4 }}
                        className="flex-1 flex items-center justify-center -mt-6"
                      >
                        <div className="h-px flex-1 bg-gradient-to-r from-border to-primary/30" />
                        <ArrowRight className="w-3.5 h-3.5 text-primary/50 mx-1 flex-shrink-0" />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </GlowBorder>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ArchitectureSection;
