"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

function CashfreeSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const verifyPayment = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(
            `/payment/cashfree/order-status/${orderId}`,
          );
          if (data.success) {
            setPaymentStatus("success");
            toast.success(data.message);
          } else {
            setPaymentStatus("failed");
            toast.error(data.message || "Payment verification failed.");
          }
        } catch (err: any) {
          setPaymentStatus("failed");
          toast.error(
            err.response?.data?.message ||
              "An error occurred during verification.",
          );
        } finally {
          setLoading(false);
        }
      };
      verifyPayment();
    } else {
      setPaymentStatus("failed");
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 text-center shadow-lg">
        {loading && (
          <div>
            <div
              className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
              role="status"
            ></div>
            <h1 className="mt-4 text-xl font-bold">Verifying Payment...</h1>
            <p className="text-gray-400">
              Please wait while we confirm your transaction.
            </p>
          </div>
        )}

        {!loading && paymentStatus === "success" && (
          <div>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold">Payment Successful!</h1>
            <p className="mt-2 text-gray-300">
              Your subscription has been activated. Welcome to Premium!
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {!loading && paymentStatus === "failed" && (
          <div>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold">Payment Failed</h1>
            <p className="mt-2 text-gray-300">
              {orderId
                ? "Could not verify your payment."
                : "No order ID found."}{" "}
              Please try again or contact support.
            </p>
            <Link
              href="/premium"
              className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CashfreeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 text-center shadow-lg">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
            role="status"
          ></div>
          <h1 className="mt-4 text-xl font-bold">Loading...</h1>
        </div>
      </div>
    }>
      <CashfreeSuccessContent />
    </Suspense>
  );
}
