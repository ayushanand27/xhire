import { PageContainer } from "./PageShell.jsx";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 py-8">
      <PageContainer className="text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} xHire. All rights reserved.</p>
        <nav className="flex gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
      </PageContainer>
    </footer>
  );
}
