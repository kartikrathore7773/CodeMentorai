"use client";

import Lottie from "lottie-react";
import readingBook from "../../lib/lottie/learning.json";

export function Education() {
  return (
    <section className="pt-24 px-4 md:px-12">
      <h1 className="text-4xl font-semibold text-center mb-12">
        My <span className="text-primary">Qualification</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <Lottie animationData={readingBook} loop className="max-w-md mx-auto" />

        <div className="space-y-6">
          {[
            {
              title: "B.Tech in Computer Science and Engineering",
              year: "2022 – 2026",
              desc: "Vit Jaipur",
            },
            {
              title: "Class 12th (RBSE)",
              year: "2021 – 2022",
              desc: "PCM Background",
            },
  
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#313131] p-6 rounded-lg shadow hover:shadow-primary transition"
            >
              <h3 className="text-xl text-primary font-semibold">
                {item.title}
              </h3>
              <p className="text-sm text-neutral-400">{item.year}</p>
              <p className="text-sm mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
