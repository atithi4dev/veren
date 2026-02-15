import ScrollReveal from "./ScrollReveal";
import GlowBorder from "../ui/GlowBorder";
import "../ui/GlowBorder.css";
import { motion } from "framer-motion";

const codeSnippet = `# veren.yaml — deployment configuration

project: my-app
source:
  repository: github.com/team/my-app
  branch: main

build:
  runtime: node:20
  command: npm run build
  output: ./dist

deploy:
  strategy: rolling
  replicas: 3
  regions:
    - us-east-1
    - eu-west-1

hooks:
  post_deploy:
    - name: health-check
      endpoint: /api/health
      timeout: 30s`;

const cliSnippet = `$ veren deploy --project my-app

  ✓ Source fetched from github.com/team/my-app
  ✓ Build completed in 12.4s
  ✓ Artifacts stored (2.1 MB)
  ✓ Deployed to 3 replicas across 2 regions
  ✓ Health check passed

  🚀 Live at https://my-app.veren.dev`;

const CodeSection = () => {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 gradient-radial pointer-events-none" />
      <div className="section-container relative z-10">
        <ScrollReveal>
          <p className="mono text-xs text-primary tracking-widest uppercase mb-4">
            Developer Experience
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="heading-lg max-w-3xl mb-6">
            Configure once,{" "}
            <span className="text-muted-foreground">deploy everywhere.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="body-lg max-w-2xl mb-16">
            A single YAML file defines your entire deployment pipeline.
            Or use the CLI for instant deploys.
          </p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-6">
          <ScrollReveal delay={0.2}>
            <div className="glass-card rounded-xl overflow-hidden h-full">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <span className="mono text-xs text-muted-foreground ml-2">veren.yaml</span>
              </div>
              <GlowBorder>
                <motion.pre
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="p-5 text-xs mono leading-relaxed text-muted-foreground overflow-x-auto rounded-xl"
                >
                  <code>{codeSnippet}</code>
                </motion.pre>
              </GlowBorder>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="glass-card rounded-xl overflow-hidden h-full">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <span className="mono text-xs text-muted-foreground ml-2">terminal</span>
              </div>
              <GlowBorder>
                <motion.pre
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="p-5 text-xs mono leading-relaxed text-muted-foreground overflow-x-auto rounded-xl"
                >
                  <code>{cliSnippet}</code>
                </motion.pre>
              </GlowBorder>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default CodeSection;
