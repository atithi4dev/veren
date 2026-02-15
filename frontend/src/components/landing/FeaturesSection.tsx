import ScrollReveal from "./ScrollReveal";
import { Server, Cog, HardDrive, Database, Workflow } from "lucide-react";
import GlowBorder from "../ui/GlowBorder";
import "../ui/GlowBorder.css";

const features = [
  {
    icon: Server,
    title: "API Gateway",
    description:
      "Handles deployment requests, authentication, and routing. The single entry point for all operations.",
  },
  {
    icon: Cog,
    title: "Worker Services",
    description:
      "Distributed build and deployment execution. Scalable workers process jobs in parallel.",
  },
  {
    icon: HardDrive,
    title: "Artifact Storage",
    description:
      "Securely stores build outputs and deployment artifacts with versioning and rollback support.",
  },
  {
    icon: Database,
    title: "Database Layer",
    description:
      "Tracks deployment state, logs, and metadata. Full observability into every deployment.",
  },
  {
    icon: Workflow,
    title: "Async Event System",
    description:
      "Event-driven architecture for reliable asynchronous job processing and workflow orchestration.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="section-container">
        <ScrollReveal>
          <p className="mono text-xs text-primary tracking-widest uppercase mb-4">
            Features
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="heading-lg max-w-3xl mb-20">
            Everything you need to{" "}
            <span className="text-muted-foreground">ship reliably.</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={0.08 * i}>
              <GlowBorder className="h-full">
                <div className="glass-card-hover p-8 h-full group">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-5 border border-border group-hover:border-primary/30 transition-colors duration-500">
                    <feature.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="body-md">{feature.description}</p>
                </div>
              </GlowBorder>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
