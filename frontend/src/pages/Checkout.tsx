import React, { useState } from "react";
import { z } from "zod";
import PayButton from "../components/PayButton";
import {
  paymentSchema,
  type PaymentFormData,
  type FormErrors,
  getValidationErrors,
  validateField,
} from "../utils/validation";

const Checkout: React.FC = () => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{
    amount: boolean;
    phone: boolean;
    email: boolean;
  }>({
    amount: false,
    phone: false,
    email: false,
  });

  const generateOrderId = (): string => {
    return `ORD${Date.now()}${Math.random()
      .toString(36)
      .substring(2, 8)}`.toUpperCase();
  };

  // Handle input changes with validation
  const handleInputChange = (
    field: keyof PaymentFormData,
    value: string | number
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Validate on change if field was touched
    if (touched[field as keyof typeof touched]) {
      const fieldError = validateField(paymentSchema, field, value);
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  // Handle blur events
  const handleBlur = (field: keyof PaymentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldError = validateField(paymentSchema, field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const validateForm = (): boolean => {
    try {
      paymentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = getValidationErrors(error);
        setErrors(newErrors);

        setTouched({ amount: true, phone: true, email: true });
      }
      return false;
    }
  };

  const isFormValid = (): boolean => {
    try {
      paymentSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const getFieldError = (field: keyof FormErrors): string | undefined => {
    return touched[field as keyof typeof touched] ? errors[field] : undefined;
  };

  return (
    <div className="flex items-center justify-center min-h-screen  px-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 md:p-8 text-white">
        <h1 className="text-2xl font-semibold text-center mb-6">
          PhonePe Payment Demo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (₹) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.amount || ""}
              onChange={(e) =>
                handleInputChange("amount", Number(e.target.value) || 0)
              }
              onBlur={() => handleBlur("amount")}
              placeholder="eg. 100"
              min="1"
              max="100000"
              className={`w-full px-3 py-2 rounded-lg bg-gray-800 border focus:ring focus:ring-purple-500/40 outline-none transition ${
                getFieldError("amount")
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-700 focus:border-purple-500"
              }`}
            />
            {getFieldError("amount") && (
              <p className="mt-1 text-sm text-red-400">
                {getFieldError("amount")}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                handleInputChange(
                  "phone",
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              onBlur={() => handleBlur("phone")}
              placeholder="ex-9876543210"
              maxLength={10}
              className={`w-full px-3 py-2 rounded-lg bg-gray-800 border focus:ring focus:ring-purple-500/40 outline-none transition ${
                getFieldError("phone")
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-700 focus:border-purple-500"
              }`}
            />
            {getFieldError("phone") && (
              <p className="mt-1 text-sm text-red-400">
                {getFieldError("phone")}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="ag.test@gmail.com"
              className={`w-full px-3 py-2 rounded-lg bg-gray-800 border focus:ring focus:ring-purple-500/40 outline-none transition ${
                getFieldError("email")
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-700 focus:border-purple-500"
              }`}
            />
            {getFieldError("email") && (
              <p className="mt-1 text-sm text-red-400">
                {getFieldError("email")}
              </p>
            )}
          </div>

          {/* Pay Button */}
          <div className="md:col-span-2 flex justify-center">
            <PayButton
              amount={formData.amount}
              orderId={generateOrderId()}
              customerPhone={formData.phone}
              customerEmail={formData.email || undefined}
              disabled={!isFormValid()}
              onValidationError={() => validateForm()}
            />
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).filter((key) => errors[key as keyof FormErrors])
            .length > 0 && (
            <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 font-medium mb-1">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-red-400 list-disc list-inside space-y-1">
                {errors.amount && <li>{errors.amount}</li>}
                {errors.phone && <li>{errors.phone}</li>}
                {errors.email && <li>{errors.email}</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
