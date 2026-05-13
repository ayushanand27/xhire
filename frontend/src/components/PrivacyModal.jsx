export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border/30">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-8 text-foreground space-y-4">
          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Introduction</h3>
            <p className="text-muted-foreground leading-relaxed">
              At xHire, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Information We Collect</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Account registration information</li>
              <li>Communication records</li>
              <li>Code samples and technical data</li>
              <li>Session recordings (with consent)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">How We Use Your Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Provide and improve our services</li>
              <li>Communicate with you</li>
              <li>Process transactions</li>
              <li>Ensure data and system security</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Data Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access and alteration.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Your Rights</h3>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, modify, or delete your personal information at any time. Contact us for requests.
            </p>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-border/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
