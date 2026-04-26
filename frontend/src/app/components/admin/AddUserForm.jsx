import { useState } from 'react';

const INITIAL_FORM = { name: '', email: '', password: '', role: 'USER' };

const AddUserForm = ({ onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(INITIAL_FORM);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(form);
    if (success) setForm(INITIAL_FORM);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">

      <form onSubmit={handleSubmit} className="space-y-4">

        <Field label="Full Name">
          <input type="text" value={form.name} onChange={set('name')}
            className={inputCls} placeholder="Full Name" required />
        </Field>

        <Field label="Email">
          <input type="email" value={form.email} onChange={set('email')}
            className={inputCls} placeholder="user@example.com" required />
        </Field>

        <Field label="Password">
          <input type="password" value={form.password} onChange={set('password')}
            className={inputCls} placeholder="••••••••" required />
        </Field>

        <Field label="Role">
          <select value={form.role} onChange={set('role')} className={inputCls}>
            <option value="USER">Member</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

const inputCls = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {children}
  </div>
);

export default AddUserForm;
