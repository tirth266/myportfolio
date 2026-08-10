import { motion } from "framer-motion";

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {task.description || 'No description provided.'}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
            task.completed
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-orange-500/15 text-orange-300'
          }`}
        >
          {task.completed ? 'Completed' : 'Pending'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
        <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
        <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
        >
          Delete
        </button>
      </div>
    </motion.article>
  );
}

export default TaskCard;
