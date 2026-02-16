import ScrollReveal from "./ScrollReveal";
import {
  Rocket,
  Cloud,
  BarChart3,
  Lock,
  RefreshCw,
  Eye,
} from "lucide-react";
import GlowBorder from "../ui/GlowBorder";
import "../ui/GlowBorder.css";

const benefits = [
  {
    icon: Rocket,
    title: "Automated Pipelines",
    description: "From commit to production with zero manual steps.",
  },
  {
    icon: Cloud,
    title: "Cloud-Native",
    description: "Built for modern infrastructure from day one.",
  },
  {
    icon: BarChart3,
    title: "Scalable Architecture",
    description: "Distributed workers scale with your deployment needs.",
  },
  {
    icon: Lock,
    title: "Centralized Control",
    description: "One platform for all your deployment operations.",
  },
  {
    icon: RefreshCw,
    title: "Reliable Processing",
    description: "Async event-driven workflows with automatic retries.",
  },
  {
    icon: Eye,
    title: "Full Observability",
    description: "Logs, metrics, and deployment state at a glance.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-32 relative">
      <div className="section-container">
        <ScrollReveal>
          <p className="mono text-xs text-primary tracking-widest uppercase mb-4">
            Benefits
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="heading-lg max-w-3xl mb-20">
            Built for developers who{" "}
            <span className="text-muted-foreground">ship fast.</span>
          </h2>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <ScrollReveal key={benefit.title} delay={0.08 * i}>
              <GlowBorder>
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors duration-500">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1.5">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </GlowBorder>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
