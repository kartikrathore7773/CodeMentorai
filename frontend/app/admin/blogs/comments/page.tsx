"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminComments() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem("token");

      const { data } = await api.get("/admin/comments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setComments(data.comments || []);
    };

    fetchComments();
  }, []);

  return (
    <div>
      <h2 className="font-bold mb-3">Comments Management</h2>

      {comments.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c: any) => (
            <div key={c._id} className="border p-4 rounded">
              <p className="font-semibold">{c.comment}</p>
              <p className="text-sm text-gray-600">
                By: {c.userId?.name || "Unknown"} | Blog:{" "}
                {c.blogId?.title || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
