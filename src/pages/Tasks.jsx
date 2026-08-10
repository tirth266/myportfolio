import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "../components/Spinner";
import TaskCard from "../components/TaskCard";

const API_BASE_URL = 'http://localhost:3000/tasks';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRequest, setLastRequest] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const startedAt = Date.now();
      const response = await axios.get(API_BASE_URL, { params: { title: search, completed: filterStatus === 'all' ? undefined : filterStatus === 'completed', sort: sortOrder } });
      const duration = Date.now() - startedAt;
      setTasks(response.data?.data?.tasks || []);
      setLastRequest({ method: 'GET', status: response.status, time: duration, timestamp: new Date().toLocaleString() });
    } catch (err) {
      setError('Cannot connect to server. Please make sure the backend is running.');
      setLastRequest({ method: 'GET', status: 500, time: 0, timestamp: new Date().toLocaleString() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, filterStatus, sortOrder]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completedCount = tasks.filter((task) => task.completed).length;
    const pendingCount = total - completedCount;
    const completionPercentage = total ? Math.round((completedCount / total) * 100) : 0;

    return { total, completedCount, pendingCount, completionPercentage };
  }, [tasks]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCompleted(false);
    setEditingId(null);
  };

  const submitTask = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Title required', text: 'Please enter a task title.' });
      return;
    }

    try {
      setLoading(true);
      const payload = { title: title.trim(), description: description.trim(), completed };
      const startedAt = Date.now();
      const response = editingId
        ? await axios.put(`${API_BASE_URL}/${editingId}`, payload)
        : await axios.post(API_BASE_URL, payload, { headers: { 'Content-Type': 'application/json' } });
      const duration = Date.now() - startedAt;
      setLastRequest({ method: editingId ? 'PUT' : 'POST', status: response.status, time: duration, timestamp: new Date().toLocaleString() });
      Swal.fire({ icon: 'success', title: editingId ? 'Task updated successfully' : 'Task saved successfully', text: response.data?.message || 'Request completed.' });
      resetForm();
      fetchTasks();
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to complete request.';
      setError(message);
      Swal.fire({ icon: 'error', title: 'Error', text: message });
      setLastRequest({ method: editingId ? 'PUT' : 'POST', status: err?.response?.status || 500, time: 0, timestamp: new Date().toLocaleString() });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setCompleted(task.completed);
  };

  const removeTask = async (task) => {
    const result = await Swal.fire({
      title: 'Delete?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ff6b3d',
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const startedAt = Date.now();
      const response = await axios.delete(`${API_BASE_URL}/${task.id}`);
      const duration = Date.now() - startedAt;
      setLastRequest({ method: 'DELETE', status: response.status, time: duration, timestamp: new Date().toLocaleString() });
      Swal.fire({ icon: 'success', title: 'Task deleted successfully' });
      fetchTasks();
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to delete task.';
      setError(message);
      Swal.fire({ icon: 'error', title: 'Error', text: message });
      setLastRequest({ method: 'DELETE', status: err?.response?.status || 500, time: 0, timestamp: new Date().toLocaleString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">Advanced Web Development Frameworks Practical 4</p>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">Task Manager REST API</h1>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Build, search, filter, sort, and monitor CRUD operations with a polished Express-powered experience.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Express', 'Node.js', 'REST API', 'Middleware', 'CRUD'].map((badge) => (
                  <span key={badge} className="rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-sm text-orange-300">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Developer Panel</p>
              <p className="mt-2">Last Request: {lastRequest?.method || '—'}</p>
              <p>Status: {lastRequest?.status || '—'}</p>
              <p>Response Time: {lastRequest?.time ? `${lastRequest.time}ms` : '—'}</p>
              <p>Timestamp: {lastRequest?.timestamp || '—'}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">Task Creation Form</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{editingId ? 'Edit Task' : 'Create Task'}</h2>
              </div>
            </div>

            <form onSubmit={submitTask} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-200">
                <span className="mb-2 block">Title</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 focus:border-orange-400" placeholder="Enter task title" />
              </label>
              <label className="block text-sm font-medium text-slate-200">
                <span className="mb-2 block">Description</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-orange-400" placeholder="Add a short task description" />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <input checked={completed} onChange={(event) => setCompleted(event.target.checked)} type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent accent-orange-500" />
                Mark as completed
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">{editingId ? 'Update Task' : 'Create Task'}</button>
                <button type="button" onClick={resetForm} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">Reset</button>
              </div>
            </form>
          </motion.section>

          <motion.section initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Total Tasks', value: stats.total },
                { label: 'Completed', value: stats.completedCount },
                { label: 'Pending', value: stats.pendingCount },
                { label: 'Completion %', value: `${stats.completionPercentage}%` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.16)] backdrop-blur">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-400">Tasks List</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Manage your tasks</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-orange-400" />
              <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-orange-400">
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-orange-400">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="mt-8 rounded-3xl border border-orange-400/20 bg-orange-500/10 p-8 text-center">
              <p className="text-lg font-semibold text-white">{error}</p>
              <button onClick={fetchTasks} className="mt-4 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white">Retry</button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
              No tasks yet. Create a task to get started.
            </div>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={startEdit} onDelete={removeTask} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </section>
    </main>
  );
}

export default TasksPage;
