import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Save, Eye, EyeOff, ArrowLeft, User, Lock,
  Shield, CheckCircle, AlertCircle, Mail, Pencil, X,
} from 'lucide-react';
import { authAPI } from '../../lib/api';

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  ADMIN:   { label: 'Admin',   dot: 'bg-rose-500',  pill: 'bg-rose-50 text-rose-700 ring-rose-200'    },
  MANAGER: { label: 'Manager', dot: 'bg-sky-500',   pill: 'bg-sky-50 text-sky-700 ring-sky-200'       },
  USER:    { label: 'Member',  dot: 'bg-slate-400', pill: 'bg-slate-50 text-slate-600 ring-slate-200'  },
};

const dashboardPath = (role) =>
  role === 'ADMIN'   ? '/dashboard/admin'   :
  role === 'MANAGER' ? '/dashboard/manager' : '/dashboard/member';

// ── Primitives ────────────────────────────────────────────────────────────────
const inputCls = (disabled) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none font-medium ${
    disabled
      ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
      : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
  }`;

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, aside }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-indigo-400" />
      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{title}</span>
    </div>
    {aside}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing,    setIsEditing]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState(null);

  const blank = { currentPassword: '', newPassword: '', confirmPassword: '' };

  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', ...blank,
  });

  useEffect(() => {
    if (user) setForm(p => ({ ...p, name: user.name, email: user.email }));
  }, [user]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const cancel = () => {
    setIsEditing(false);
    setMessage(null);
    setForm({ name: user?.name || '', email: user?.email || '', ...blank });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.updateProfile(
        form.name, form.email,
        form.newPassword ? form.currentPassword : undefined,
        form.newPassword || undefined,
      );
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setForm(p => ({ ...p, ...blank }));
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const role    = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.USER;
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 flex flex-col">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(dashboardPath(user?.role), { replace: true })}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">My Profile</span>
        </div>
      </div>

      {/* ── Alert banner ── */}
      {message && (
        <div className="max-w-4xl mx-auto w-full px-6 mt-4">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main card ── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">

            {/* ── Hero panel ── */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 px-10 py-10 overflow-hidden">
              {/* Decorative rings */}
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-16 -right-4 w-64 h-64 rounded-full bg-white/[0.03]" />
              <div className="absolute top-6 right-24 w-20 h-20 rounded-full bg-white/5" />

              <div className="relative flex items-center gap-7">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">{initial}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-indigo-700" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white tracking-tight truncate">{user?.name}</h1>
                  <p className="text-indigo-300 text-sm mt-1 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    {user?.email}
                  </p>
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ${role.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
                      {role.label}
                    </span>
                  </div>
                </div>

                {/* Edit button */}
                {!isEditing && (
                  <button
                    onClick={() => { setIsEditing(true); setMessage(null); }}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold transition-colors backdrop-blur"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* ── Form body ── */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                {/* Left — Basic info */}
                <div className="px-8 py-8">
                  <SectionTitle icon={User} title="Basic Information" />
                  <div className="space-y-5">
                    <Field label="Full Name">
                      <input
                        type="text" name="name" value={form.name} onChange={set}
                        disabled={!isEditing} className={inputCls(!isEditing)}
                        placeholder="Your full name"
                      />
                    </Field>
                    <Field label="Email Address">
                      <input
                        type="email" name="email" value={form.email} onChange={set}
                        disabled={!isEditing} className={inputCls(!isEditing)}
                        placeholder="your@email.com"
                      />
                    </Field>
                    <Field label="Role">
                      <div className={`${inputCls(true)} flex items-center gap-2`}>
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        {role.label}
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Right — Password */}
                <div className="px-8 py-8">
                  <SectionTitle
                    icon={Lock}
                    title="Change Password"
                    aside={
                      isEditing && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      )
                    }
                  />

                  {!isEditing ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium text-center max-w-[180px] leading-relaxed">
                        Click <strong className="text-slate-600">Edit</strong> to update your password
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Field label="Current Password">
                        <input
                          type={showPassword ? 'text' : 'password'} name="currentPassword"
                          value={form.currentPassword} onChange={set}
                          className={inputCls(false)} placeholder="Enter current password"
                        />
                      </Field>
                      <Field label="New Password">
                        <input
                          type={showPassword ? 'text' : 'password'} name="newPassword"
                          value={form.newPassword} onChange={set}
                          className={inputCls(false)} placeholder="New password"
                        />
                      </Field>
                      <Field label="Confirm New Password">
                        <input
                          type={showPassword ? 'text' : 'password'} name="confirmPassword"
                          value={form.confirmPassword} onChange={set}
                          className={inputCls(false)} placeholder="Repeat new password"
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Footer actions ── */}
              {isEditing && (
                <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button" onClick={cancel}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold transition-colors shadow-md shadow-indigo-200/50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};