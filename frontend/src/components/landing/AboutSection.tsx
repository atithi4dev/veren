import ScrollReveal from "./ScrollReveal";
import GlowBorder from "../ui/GlowBorder";
import "../ui/GlowBorder.css";
import { Cpu, Zap, Shield } from "lucide-react";

const highlights = [
  {
    icon: Cpu,
    title: "Backend-first",
    description: "Built from the ground up for infrastructure automation and deployment orchestration.",
  },
  {
    icon: Zap,
    title: "Fully automated",
    description: "Push code and let Veren handle building, deploying, and scaling your applications.",
  },
  {
    icon: Shield,
    title: "Production ready",
    description: "Reliable, scalable infrastructure designed for real-world workloads.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 relative">
      <div className="section-container">
        <ScrollReveal>
          <p className="mono text-xs text-primary tracking-widest uppercase mb-4">
            What is Veren
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="heading-lg max-w-3xl mb-6">
            A deployment platform that{" "}
            <span className="text-muted-foreground">
              eliminates infrastructure complexity.
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="body-lg max-w-2xl mb-8">
            Veren is a backend-first platform that automates build pipelines
            and deployment workflows. It connects your source repositories to
            production infrastructure through a cloud-native, service-oriented
            architecture.
          </p>
        </ScrollReveal>

        {/* Project Details Section moved to end */}

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {highlights.map((item, i) => (
            <ScrollReveal key={item.title} delay={0.1 * i}>
              <GlowBorder className="h-full">
                <div className="glass-card-hover p-8 h-full">
                  <item.icon className="w-5 h-5 text-primary mb-5" />
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="body-md">{item.description}</p>
                </div>
              </GlowBorder>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
