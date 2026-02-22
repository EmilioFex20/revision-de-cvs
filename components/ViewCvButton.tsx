"use client";

import { useState } from "react";

export default function ViewCvButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/cv/presign?student_id=${encodeURIComponent(studentId)}`,
      );
      if (!res.ok) throw new Error("Failed to presign");
      const data = await res.json();
      window.open(data.url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg border px-3 py-2 text-sm bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
    >
      {loading ? "Opening..." : "View CV"}
    </button>
  );
}
