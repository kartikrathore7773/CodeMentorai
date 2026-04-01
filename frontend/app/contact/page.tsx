"use client";

import { useState } from "react";
import api from "@/lib/api";
import axios from "axios";
import "./contact.css";

export default function GeneralContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/contact/create", form);
      if (res.data.success) {
        alert("Message sent successfully 🚀");
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "general",
          message: "",
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error");
      } else {
        alert("Something went wrong");
      }
    }
  };

  const subjects = [
    { value: "general", label: "General Query", icon: "💬" },
    { value: "service", label: "Service", icon: "💡" },
    { value: "hackathon", label: "Hackathon", icon: "⚡" },
    { value: "notes", label: "Notes", icon: "📝" },
    { value: "membership", label: "Membership", icon: "🎖️" },
    { value: "collaboration", label: "Collaboration", icon: "🤝" },
  ];

  return (
    <main className="min-h-screen bg-[#080B14] flex items-center justify-center px-4 py-20">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap"
        rel="stylesheet"
      />

      <div className="grid-bg"></div>
      <div className="glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/40"></div>
      <div className="glow absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-red-600/40"></div>

      <form onSubmit={handleSubmit} className="outer">
        {/* Left Panel */}
        <div className="left">
          <div>
            <div className="badge">
              <div className="badge-dot"></div>
              Contact Us
            </div>
            <h1 className="left-heading">
              Get in touch <br />
              <span className="grad">anytime</span>
            </h1>
            <p className="left-sub">
              We are here to help you with any questions or concerns you may
              have.
            </p>

            <label className="topics-label">Our Topics</label>
            <div className="pills">
              {subjects.map((s) => (
                <div key={s.value} className="pill">
                  {s.icon} {s.label}
                </div>
              ))}
            </div>

            <label className="channels-label">Our Channels</label>
            <div className="channels">
              <div className="channel-row">
                <div className="channel-icon">📧</div>
                <div>
                  <div className="channel-title">Email</div>
                  <div className="channel-val">kartikrathore770@gmail.com</div>
                </div>
              </div>
              <div className="channel-row">
                <div className="channel-icon">📞</div>
                <div>
                  <div className="channel-title">Phone</div>
                  <div className="channel-val">+91 9001060923</div>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-row">
            <div>
              <div className="stat-val-num">10k+</div>
              <div className="stat-lbl">Students</div>
            </div>
            <div>
              <div className="stat-val-num">50+</div>
              <div className="stat-lbl">Mentors</div>
            </div>
            <div>
              <div className="stat-val-num">100+</div>
              <div className="stat-lbl">Courses</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right">
          <h2 className="form-title">Send us a message</h2>
          <p className="form-sub">
            Fill out the form and we will get back to you as soon as possible.
          </p>

          <div className="row2">
            <div className="wrap">
              <div className="ico">👤</div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="wrap">
              <div className="ico">📧</div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="wrap">
            <div className="ico">📞</div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="chips-label">Select Subject</div>
          <div className="chips">
            {subjects.map((s) => (
              <div
                key={s.value}
                className={`chip ${form.subject === s.value ? "active" : ""}`}
                onClick={() => setForm({ ...form, subject: s.value })}
              >
                {s.label}
              </div>
            ))}
          </div>

          <div className="wrap">
            <div className="ico ico-top">💬</div>
            <textarea
              name="message"
              placeholder="Your Message"
              className="field"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn">
            <span>🚀</span>
            Send Enquiry
          </button>

          <div className="form-note">We typically reply within 24 hours.</div>
        </div>
      </form>
    </main>
  );
}
