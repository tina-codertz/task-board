import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, EyeOff, ArrowLeft, User, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../../api/api';

const ROLE_CONFIG = {
  ADMIN:   { label: 'Admin',   className: 'bg-rose-100 text-rose-700 border border-rose-200'   },
  MANAGER: { label: 'Manager', className: 'bg-sky-100 text-sky-700 border border-sky-200'       },
  USER:    { label: 'Member',  className: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const inputCls = (disabled) =>
  `w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none
   ${disabled
     ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
     : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`;

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const PasswordField = ({ name, value, onChange, showPassword, placeholder }) => (
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      name={name}
      value={value}
      onChange={onChange}
      className={inputCls(false) + ' pr-10'}
      placeholder={placeholder}
    />
  </div>
);

export const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing,    setIsEditing]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState(null);

  const blankPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

  const [formData, setFormData] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    ...blankPasswords,
  });

  useEffect(() => {
    if (user) setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    setFormData({ name: user?.name || '', email: user?.email || '', ...blankPasswords });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const payload = { name: formData.name, email: formData.email };
      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      await authAPI.updateProfile(payload.name, payload.email, payload.currentPassword, payload.newPassword);

      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setFormData(prev => ({ ...prev, ...blankPasswords }));
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const role = ROLE_CONFIG[user?.role] ?? ROLE_CONFIG.USER;

  // Back destination by role
 const dashboardPath =
  user?.role === 'ADMIN'   ? '/dashboard/admin' :
  user?.role === 'MANAGER' ? '/dashboard/manager' :
                             '/dashboard/member';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">

      {/* Back button */}
      <div className="max-w-xl mx-auto mb-4">
        <button
          onClick={() => navigate(dashboardPath,{replace:true})}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Header band */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-8">
            {/* Avatar circle */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-white/70" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">{user?.name}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
                <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${role.className}`}>
                  <Shield className="w-3 h-3" />
                  {role.label}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">

            {/* Alert */}
            {message && (
              <div className={`mb-6 flex items-start gap-3 p-4 rounded-xl text-sm font-medium border ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {message.type === 'success'
                  ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Info section */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Basic Information</h2>
                </div>
                <div className="space-y-4">
                  <Field label="Full Name">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputCls(!isEditing)}
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputCls(!isEditing)}
                    />
                  </Field>
                </div>
              </div>

              {/* Password section — only while editing */}
              {isEditing && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Change Password</h2>
                      <span className="text-xs text-slate-400 font-normal normal-case">(optional)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <Field label="Current Password">
                      <PasswordField
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        showPassword={showPassword}
                        placeholder="Enter current password"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="New Password">
                        <PasswordField
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          showPassword={showPassword}
                          placeholder="New password"
                        />
                      </Field>
                      <Field label="Confirm Password">
                        <PasswordField
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          showPassword={showPassword}
                          placeholder="Repeat password"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => { setIsEditing(true); setMessage(null); }}
                    className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving…' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};