export const ErrorAlert = ({ message, onClose }) =>
  message ? (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onClose} className="text-red-600 hover:text-red-800">×</button>
    </div>
  ) : null;

export const SuccessAlert = ({ message, onClose }) =>
  message ? (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onClose} className="text-green-600 hover:text-green-800">×</button>
    </div>
  ) : null;
