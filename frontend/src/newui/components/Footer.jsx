export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 py-8">
      <div className="mx-auto max-w-7xl px-4 text-sm text-gray-400 flex items-center justify-between">
        <p>© {new Date().getFullYear()} xHire. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
