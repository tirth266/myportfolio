import { motion } from "framer-motion";

function TaskCard({ task, onEdit, onDelete, onToggleCompletion, deletingId }) {
  const isDeleting = deletingId === task._id;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "low":
        return "bg-sky-500/15 text-sky-300 border-sky-500/30";
      default:
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    }
  };

  const formattedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur transition ${
        task.completed ? "opacity-80" : "opacity-100"
      } ${isDeleting ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {task._id && (
              <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                id: {task._id.slice(-6)}
              </span>
            )}
            <h3
              className={`text-lg font-semibold text-white ${
                task.completed ? "line-through text-slate-400" : ""
              }`}
            >
              {task.title}
            </h3>
          </div>
          <p className="text-sm leading-6 text-slate-300">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status badge */}
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
              task.completed
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                : "border-orange-500/30 bg-orange-500/15 text-orange-300"
            }`}
          >
            {task.completed ? "Completed" : "Pending"}
          </span>

          {/* Priority badge */}
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${getPriorityBadgeClass(
              task.priority
            )}`}
          >
            {task.priority || "medium"}
          </span>
        </div>
      </div>

      {formattedDate && (
        <div className="mt-3 text-xs text-slate-500">Created: {formattedDate}</div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onToggleCompletion(task)}
          disabled={isDeleting}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-40 ${
            task.completed
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
              : "bg-orange-500 text-white hover:bg-orange-400"
          }`}
        >
          {task.completed ? "Mark Pending" : "Mark Completed"}
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={isDeleting}
          className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-40"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          disabled={isDeleting}
          className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-40"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </motion.article>
  );
}

export default TaskCard;
