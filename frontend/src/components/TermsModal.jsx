export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border/30">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-8 text-foreground space-y-4">
          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-2">Agreement to Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using xHire, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-2">Use License</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Permission is granted to temporarily download one copy of the materials (information or software) on xHire for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on xHire</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-2">Disclaimer</h3>
            <p className="text-muted-foreground leading-relaxed">
              The materials on xHire are provided on an 'as is' basis. xHire makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-2">Limitations</h3>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall xHire or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on xHire.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-indigo-400 mb-2">Accuracy of Materials</h3>
            <p className="text-muted-foreground leading-relaxed">
              The materials appearing on xHire could include technical, typographical, or photographic errors. xHire does not warrant that any of the materials on xHire are accurate, complete, or current.
            </p>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-border/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
