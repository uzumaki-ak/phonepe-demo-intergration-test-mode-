import React, { useState } from "react";
import { paymentApi } from "../services/api";

interface PayButtonProps {
  amount: number;
  orderId: string;
  customerPhone: string;
  customerEmail?: string;
  disabled?: boolean;
  onValidationError?: () => void;
}

const PayButton: React.FC<PayButtonProps> = ({
  amount,
  orderId,
  customerPhone,
  customerEmail,
  disabled = false,
  onValidationError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      if (
        !amount ||
        amount <= 0 ||
        !customerPhone ||
        customerPhone.length !== 10
      ) {
        onValidationError?.();
        setError("Please check the form for errors");
        setLoading(false);
        return;
      }

      console.log(" Sending payment request...", {
        amount,
        orderId,
        customerPhone,
        customerEmail,
      });

      const result = await paymentApi.initiatePayment({
        amount,
        orderId,
        customerPhone,
        customerEmail,
      });

      console.log(" Payment API Response:", result);

      if (result.success && result.data) {
        if (result.data.redirectUrl) {
          console.log(" Redirecting to:", result.data.redirectUrl);
          window.location.href = result.data.redirectUrl;
        } else {
          console.error(" No redirectUrl in response:", result);
          setError("No payment URL received from server");
        }
      } else {
        console.error(" Payment failed:", result);
        setError(result.message || "Payment initiation failed");
      }
    } catch (err: any) {
      console.error(" Payment error:", err);
      setError(err.response?.data?.message || "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs">
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold text-white transition-all
          ${
            disabled || loading
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
          }
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ₹${amount}`
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PayButton;
