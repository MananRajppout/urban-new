import React from 'react';
import { toast } from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import '../styles/page.css';

export default function CustomToast({ t, message }) {
  return (
    <div className="custom-toast">
      <button className="custom-toast-close" onClick={() => toast.dismiss(t.id)}>
        <FaTimes />
      </button>
      <p className="custom-toast-title">{message}</p>
    </div>
  );
}

export function showCustomToast(message) {
  toast.success((t) => (
    <CustomToast t={t} message={message} />
  ), {
    duration: 4000,
    position: "top-right",
  });
}
