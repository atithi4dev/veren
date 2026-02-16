import { useState, useCallback } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CodeSection from "@/components/landing/CodeSection";
import WhySection from "@/components/landing/WhySection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import LoadingScreen from "@/components/landing/LoadingScreen";

const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const handleComplete = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={handleComplete} />}
      <div className={`min-h-screen bg-background text-foreground ${!loaded ? "overflow-hidden h-screen" : ""}`}>
        <Navbar />
        <HeroSection />
        <AboutSection />
        <ArchitectureSection />
        <FeaturesSection />
        <CodeSection />
        <WhySection />
        <BenefitsSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};

export default Index;
