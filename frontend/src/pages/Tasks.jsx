import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "../components/Spinner";
import TaskCard from "../components/TaskCard";
import { createTask, deleteTask, getTasks, updateTask } from "../services/taskApi";

// Practical 8: sweetalert2 is only needed when the user actually triggers a
// confirm/toast action, so its chunk is fetched on demand instead of on mount.
const loadSwal = () => import("sweetalert2").then((module) => module.default);

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRequest, setLastRequest] = useState(null);

  // Fetch all tasks from MongoDB REST API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const startedAt = Date.now();
      const response = await getTasks();
      const duration = Date.now() - startedAt;

      const loadedTasks = response.data?.tasks || [];
      setTasks(loadedTasks);
      setLastRequest({
        method: "GET",
        endpoint: "/tasks",
        status: response.status,
        time: duration,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Unable to connect to backend server. Make sure http://localhost:5000 is running with MongoDB connected.";
      setError(message);
      setLastRequest({
        method: "GET",
        endpoint: "/tasks",
        status: err?.response?.status || "ERR",
        time: 0,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Client-side filtering and sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          (task.title && task.title.toLowerCase().includes(search.toLowerCase())) ||
          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "completed" && task.completed) ||
          (filterStatus === "pending" && !task.completed);

        const matchesPriority =
          filterPriority === "all" || task.priority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortOrder === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortOrder === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [tasks, search, filterStatus, filterPriority, sortOrder]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completedCount = tasks.filter((task) => task.completed).length;
    const pendingCount = total - completedCount;
    const completionPercentage = total ? Math.round((completedCount / total) * 100) : 0;

    return { total, completedCount, pendingCount, completionPercentage };
  }, [tasks]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCompleted(false);
    setPriority("medium");
    setEditingId(null);
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setTitle(task.title || "");
    setDescription(task.description || "");
    setCompleted(Boolean(task.completed));
    setPriority(task.priority || "medium");
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleToggleCompletion = async (task) => {
    const Swal = await loadSwal();

    try {
      setLoading(true);
      const payload = {
        title: task.title,
        description: task.description || "",
        completed: !task.completed,
        priority: task.priority || "medium",
      };
      const startedAt = Date.now();
      const response = await updateTask(task._id, payload);
      const duration = Date.now() - startedAt;

      setLastRequest({
        method: "PUT",
        endpoint: `/tasks/${task._id}`,
        status: response.status,
        time: duration,
        timestamp: new Date().toLocaleTimeString(),
      });

      await fetchTasks();
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to update task status.";
      Swal.fire({ icon: "error", title: "Update Failed", text: message });
    } finally {
      setLoading(false);
    }
  };

  const submitTask = async (event) => {
    event.preventDefault();

    const Swal = await loadSwal();

    if (!title.trim()) {
      Swal.fire({ icon: "warning", title: "Title required", text: "Please enter a valid non-empty task title." });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        completed,
        priority,
      };
      const startedAt = Date.now();
      const response = editingId
        ? await updateTask(editingId, payload)
        : await createTask(payload);
      const duration = Date.now() - startedAt;

      setLastRequest({
        method: editingId ? "PUT" : "POST",
        endpoint: editingId ? `/tasks/${editingId}` : "/tasks",
        status: response.status,
        time: duration,
        timestamp: new Date().toLocaleTimeString(),
      });

      Swal.fire({
        icon: "success",
        title: editingId ? "Task Updated" : "Task Created",
        text: response.data?.message || "Operation successful.",
        timer: 1800,
        showConfirmButton: false,
      });

      resetForm();
      await fetchTasks();
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.response?.data?.message || "Failed to save task.";
      Swal.fire({ icon: "error", title: "Request Failed", text: message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (task) => {
    const Swal = await loadSwal();

    const result = await Swal.fire({
      title: "Delete Task?",
      text: `Are you sure you want to delete "${task.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const startedAt = Date.now();
        const response = await deleteTask(task._id);
        const duration = Date.now() - startedAt;

        setLastRequest({
          method: "DELETE",
          endpoint: `/tasks/${task._id}`,
          status: response.status,
          time: duration,
          timestamp: new Date().toLocaleTimeString(),
        });

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.data?.message || "Task deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchTasks();
      } catch (err) {
        const message = err?.response?.data?.error || "Failed to delete task.";
        Swal.fire({ icon: "error", title: "Delete Failed", text: message });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Header Section */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Practical 6 — Full Stack Integration
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Task Manager REST API
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Full-stack CRUD: React frontend → Express REST API → Mongoose → MongoDB Atlas.
                All tasks are persisted in the cloud — no local mock data.
              </p>
            </div>

            {/* Live API status indicator */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    error ? "bg-rose-500 animate-pulse" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                <span className="font-semibold text-slate-200">
                  {error ? "Database Disconnected" : "MongoDB Connected (Port 5000)"}
                </span>
              </div>
              {lastRequest && (
                <div className="mt-2 space-y-0.5 text-slate-400">
                  <div>
                    Last call: <span className="text-orange-300">{lastRequest.method} {lastRequest.endpoint}</span> →{" "}
                    <span className={lastRequest.status === 200 || lastRequest.status === 201 ? "text-emerald-300" : "text-rose-400"}>
                      {lastRequest.status}
                    </span>{" "}
                    ({lastRequest.time}ms)
                  </div>
                  <div>Time: {lastRequest.timestamp}</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400">Total Tasks</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.completedCount}</p>
              <p className="text-xs uppercase tracking-wider text-emerald-300">Completed</p>
            </div>
            <div className="rounded-2xl bg-orange-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">{stats.pendingCount}</p>
              <p className="text-xs uppercase tracking-wider text-orange-300">Pending</p>
            </div>
            <div className="rounded-2xl bg-sky-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-sky-400">{stats.completionPercentage}%</p>
              <p className="text-xs uppercase tracking-wider text-sky-300">Progress</p>
            </div>
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchTasks}
                className="rounded bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Create / Edit Task Form */}
          <section className="lg:col-span-1">
            <div className="sticky top-8 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Task" : "Create New Task"}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {editingId ? "Update MongoDB document via PUT /tasks/:id" : "Store in MongoDB via POST /tasks"}
              </p>

              <form onSubmit={submitTask} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300">
                    Title <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Learn Mongoose"
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief details about the task..."
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-orange-400"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="completedCheckbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-400"
                  />
                  <label htmlFor="completedCheckbox" className="text-xs text-slate-300">
                    Mark as completed
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    {editingId ? "Update Task" : "Create Task"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>

          {/* Tasks List and Controls */}
          <section className="space-y-6 lg:col-span-2">
            {/* Filters & Search */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-400 sm:w-56"
              />

              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter tasks by status"
                  className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  aria-label="Filter tasks by priority"
                  className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 outline-none"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort tasks order"
                  className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>

                <button
                  type="button"
                  onClick={fetchTasks}
                  className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Task Cards Container */}
            {loading && tasks.length === 0 ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
                <p className="text-slate-400">No tasks found matching your criteria.</p>
                <button
                  onClick={resetForm}
                  className="mt-4 text-sm font-semibold text-orange-400 hover:underline"
                >
                  Create your first task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      onToggleCompletion={handleToggleCompletion}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default TasksPage;
