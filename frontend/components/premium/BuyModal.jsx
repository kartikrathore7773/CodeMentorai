"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import "./BuyModal.css";

export default function BuyModal({ plan, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const [form, setForm] = useState({
    name: "",
    telegramUsername: "",
    mobile: "",
    email: "",
    note: "",
    transactionId: "",
    couponCode: "",
    referralCode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= PAYMENT ================= */
  const handlePayment = async () => {
    if (paymentMethod === "razorpay") {
      handleRazorpayPayment();
    } else {
      handleCashfreePayment();
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/payment/create-order", {
        serviceId: plan._id,
      });

      const order = data.order;
      const options = {
        key: data.key,
        amount: order.amount,
        currency: order.currency,
        name: "CodeMentor AI Premium",
        description: plan.title,
        order_id: order.id,
        handler: async function (response) {
          try {
            if (!window.Razorpay) {
              toast.error("Payment gateway failed to load");
              return;
            }
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              serviceId: plan._id,
            });
            toast.success("Payment Successful!");
            setForm((prev) => ({
              ...prev,
              transactionId: response.razorpay_payment_id,
            }));
            setStep(2);
          } catch (err) {
            toast.error("Payment verification failed");
            console.error(err);
          }
        },
        theme: { color: "#16a34a" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCashfreePayment = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/payment/cashfree/create-order", {
        serviceId: plan._id,
      });

      // Redirect to Cashfree payment page
      window.location.href = data.payment_link;
    } catch (err) {
      console.error(err);
      toast.error("Cashfree payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post("/premium/buy", { serviceId: plan._id, ...form });
      toast.success("Subscription request submitted");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="buy-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="buy-card">
          {/* ── Header ── */}
          <div className="buy-header">
            <div className="buy-header-step">
              <div className={`step-dot ${step >= 1 ? "active" : ""}`} />
              <div className={`step-dot ${step >= 2 ? "active" : ""}`} />
            </div>
            <h2>{step === 1 ? "Confirm Purchase" : "Complete Your Details"}</h2>
            <p>
              {step === 1
                ? "Secure payment via Razorpay"
                : "Step 2 of 2 — Fill in your info"}
            </p>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          {/* ── Body ── */}
          <div className="buy-body">
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                <div className="plan-pill">
                  <div>
                    <div className="plan-pill-label">Selected Plan</div>
                    <div className="plan-pill-name">{plan.title}</div>
                  </div>
                  <div className="plan-pill-price">₹{plan.price}</div>
                </div>

                <div className="payment-method-selector">
                  <button
                    className={`payment-method-btn ${paymentMethod === "razorpay" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("razorpay")}
                  >
                    Razorpay
                  </button>
                  <button
                    className={`payment-method-btn ${paymentMethod === "cashfree" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("cashfree")}
                  >
                    Cashfree
                  </button>
                </div>

                <button
                  className="pay-btn"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : "🔒"}
                  {loading
                    ? "Initializing..."
                    : `Pay ₹${plan.price} with ${paymentMethod === "razorpay" ? "Razorpay" : "Cashfree"}`}
                </button>

                <p className="secure-note">
                  🛡️ 256-bit encrypted · Powered by{" "}
                  {paymentMethod === "razorpay" ? "Razorpay" : "Cashfree"}
                </p>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <div className="form-grid">
                  <div className="field-wrap full">
                    <label>Full Name</label>
                    <input
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-wrap">
                    <label>Mobile</label>
                    <input
                      name="mobile"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-wrap">
                    <label>Email</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-wrap full">
                    <label>Telegram Username</label>
                    <input
                      name="telegramUsername"
                      placeholder="@username"
                      value={form.telegramUsername}
                      onChange={handleChange}
                    />
                  </div>

                  <hr
                    className="divider full"
                    style={{ gridColumn: "1 / -1" }}
                  />

                  <div className="field-wrap">
                    <label>
                      Coupon Code <span className="optional-tag">optional</span>
                    </label>
                    <input
                      name="couponCode"
                      placeholder="SAVE10"
                      value={form.couponCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-wrap">
                    <label>
                      Referral Code{" "}
                      <span className="optional-tag">optional</span>
                    </label>
                    <input
                      name="referralCode"
                      placeholder="REF123"
                      value={form.referralCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-wrap full">
                    <label>
                      Note <span className="optional-tag">optional</span>
                    </label>
                    <textarea
                      name="note"
                      placeholder="Anything you'd like us to know…"
                      value={form.note}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field-wrap full">
                    <label>Transaction ID</label>
                    <input
                      name="transactionId"
                      value={form.transactionId}
                      readOnly
                      className="readonly"
                    />
                  </div>
                </div>

                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : null}
                  {loading ? "Submitting..." : "Submit Details →"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
