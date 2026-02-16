const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="section-container flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold">Veren</span>
          <span className="text-xs text-muted-foreground">
            Deployment infrastructure, automated.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/atithi4dev/veren"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Veren
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
