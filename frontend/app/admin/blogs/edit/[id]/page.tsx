"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminBlogForm from "@/components/admin/AdminBlogForm";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/admin/blogs/${id}`)
      .then((res) => {
        setBlog(res.data);
      })
      .catch((err) => {
        console.error("Error fetching blog:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!blog) {
    return <div>Blog not found</div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold mb-4">Edit Blog</h1>
      <AdminBlogForm
        isEdit
        blogId={id}
        initialData={{
          ...blog,
          tags: blog.tags?.join(", ") || "",
        }}
      />
    </div>
  );
}
