import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Job Oriented Courses & Notes | CodeMentor AI",
  description:
    "Explore job-oriented courses and premium notes by CodeMentor AI. Learn coding, software development, IT skills, and digital roles with beginner-friendly, placement-focused content.",

  keywords: [
    "job oriented courses",
    "software development course",
    "coding courses for beginners",
    "IT courses for freshers",
    "online courses india",
    "software job preparation",
    "CodeMentor AI",
    "Referrals",
    "CodeWithSuraj",
  ],

  openGraph: {
    title: "Job Oriented Courses & Notes | CodeMentor AI",
    description:
      "Learn coding, software development, and IT skills with CodeMentor AI’s job-ready courses and notes.",
    url: "https://CodeMentor AI.com/courses",
    siteName: "CodeMentor AI",
    images: [
      {
        url: "https://CodeMentor AI.com/og/courses.png",
        width: 1200,
        height: 630,
        alt: "CodeMentor AI Courses & Notes",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Job Oriented Courses & Notes | CodeMentor AI",
    description:
      "Upgrade your skills with CodeMentor AI’s job-oriented courses and notes.",
    images: ["https://CodeMentor AI.com/og/courses.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
