"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`).then((res) => {
      setCourse(res.data.course);
      if (res.data.course.bannerImage) {
        if (res.data.course.bannerImage.url) {
          setBannerUrl(res.data.course.bannerImage.url);
          setBannerPreview(res.data.course.bannerImage.url);
        } else if (res.data.course.bannerImage.filePath) {
          const filePath = res.data.course.bannerImage.filePath.replace(
            /^\/+/,
            "",
          );
          const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(
            /\/+$/,
            "",
          );
          setBannerPreview(`${apiUrl}/${filePath}`);
        }
      }
    });
  }, [id]);

  const handleBannerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerUrl(e.target.value);
    setBannerPreview(e.target.value);
  };

  const update = async () => {
    setIsLoading(true);
    const fd = new FormData();
    Object.entries(course).forEach(([k, v]) => {
      if (
        (typeof v === "string" || typeof v === "number") &&
        k !== "bannerImage"
      )
        fd.append(k, String(v));
    });

    if (pdf) fd.append("pdf", pdf);
    if (bannerUrl.trim()) fd.append("bannerUrl", bannerUrl.trim());

    try {
      await api.put(`/admin/courses/${id}`, fd);
      toast.success("Updated");
      router.push("/admin/courses");
    } catch {
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!course)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        Edit Course
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Title
            </label>
            <input
              id="title"
              value={course.title}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={course.description}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) =>
                setCourse({
                  ...course,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price ($)
            </label>
            <input
              id="price"
              type="number"
              value={course.price}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) =>
                setCourse({
                  ...course,
                  price: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="bannerUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course Banner URL
            </label>
            {bannerPreview && (
              <div className="mt-2 mb-4">
                <Image
                  src={bannerPreview}
                  alt="Banner Preview"
                  width={400}
                  height={200}
                  className="rounded-md object-cover"
                />
              </div>
            )}
            <input
              id="bannerUrl"
              type="url"
              value={bannerUrl}
              placeholder="https://example.com/banner.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              onChange={handleBannerUrlChange}
            />
          </div>

          <div>
            <label
              htmlFor="pdf"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Course PDF
            </label>
            <input
              id="pdf"
              type="file"
              accept="application/pdf"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              onChange={(e) => setPdf(e.target.files?.[0] || null)}
            />
            {course.pdf && (
              <p className="text-sm text-gray-500 mt-2">
                Current PDF:{" "}
                <a
                  href={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")}/${course.pdf.filePath.replace(/^\/+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  View PDF
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-6 border-t">
        <button
          onClick={update}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? "Updating..." : "Update Course"}
        </button>
      </div>
    </div>
  );
}
