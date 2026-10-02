"use client";

import { useState } from "react";

export default function PasswordInput({
  className,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input {...props} type={visible ? "text" : "password"} className={className} style={{ ...style, paddingRight: 40 }} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        tabIndex={-1}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
