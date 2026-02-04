import { useEffect, useState } from "react";
import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const [sessionTitle, setSessionTitle] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const initialTitle = typeof roomConfig?.title === "string" ? roomConfig.title : "";
    setSessionTitle(initialTitle);
  }, [isOpen, roomConfig?.title]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-gradient-to-br from-base-100 to-base-200 border border-primary/10 shadow-2xl">
        {/* Header with gradient */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-primary/10">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
            <Code2Icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Create New Session</h3>
        </div>

        <div className="space-y-6">
          {/* SESSION TITLE */}
          <div className="space-y-3">
            <label className="label">
              <span className="label-text font-bold text-base">Session Title</span>
              <span className="label-text-alt text-base-content/60">(optional)</span>
            </label>

            <input
              className="input input-bordered w-full border-2 border-primary/20 hover:border-primary/50 focus:border-primary transition-colors bg-base-100 rounded-lg font-medium"
              value={sessionTitle}
              onChange={(e) => {
                const next = e.target.value;
                setSessionTitle(next);
                setRoomConfig({
                  ...(roomConfig || {}),
                  title: next,
                });
              }}
              placeholder="e.g. Frontend Interview with Ayush"
              maxLength={80}
            />
            <p className="text-xs text-base-content/60">
              This is what people will see in the session list.
            </p>
          </div>

          {/* WHAT YOU GET */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-success/10 to-primary/10 border-2 border-success/20 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-success/20 to-success/10 rounded-lg">
                <Code2Icon className="size-5 text-success" />
              </div>
              <p className="font-bold text-lg text-success">Session Includes</p>
            </div>
            <div className="grid gap-2 text-sm text-base-content/70 pl-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-success rounded-full" />
                Audio/Video call + screen share
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-success rounded-full" />
                Shared code editor (real-time sync)
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-success rounded-full" />
                Invite link to join remotely
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action mt-10 gap-3">
          <button
            className="px-6 py-3 rounded-lg border-2 border-base-300 hover:bg-base-200/50 font-bold transition-all duration-200"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>

          <button
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-bold text-white flex items-center gap-2 hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            onClick={onCreateRoom}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <LoaderIcon className="size-5 animate-spin" />
                Creating Session...
              </>
            ) : (
              <>
                <PlusIcon className="size-5" />
                Create Session
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={onClose} />
    </div>
  );
}

export default CreateSessionModal;
