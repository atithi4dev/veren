import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Architecture", href: "#architecture" },
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500
          ${scrolled
            ? "glass-card px-4 py-3 shadow-2xl shadow-black/40 mt-0 md:max-w-4xl md:mx-auto md:px-6 md:py-3 md:mt-4 md:left-1/2 md:-translate-x-1/2"
            : "glass-card px-4 py-4 mt-0 md:max-w-7xl md:mx-auto md:px-6 md:py-4 md:left-1/2 md:-translate-x-1/2 md:mt-4"}
        `}
        style={scrolled ? { borderRadius: "9999px" } : {}}
      >
        <div className="flex items-center justify-between">
          <a href="#" className="text-xl font-bold tracking-tight text-foreground">
            Veren
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/atithi4dev/veren"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-foreground p-1"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-[99] bg-background/95 backdrop-blur-xl flex flex-col pt-24 px-4 w-full h-full"
          >
            <div className="flex flex-col gap-6 w-full">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-medium text-foreground w-full text-left"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://github.com/atithi4dev/veren"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-lg text-muted-foreground w-full text-left"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
