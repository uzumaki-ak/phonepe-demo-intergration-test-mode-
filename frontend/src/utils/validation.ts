import { z } from 'zod';

// PhonePe payment validation schema
export const paymentSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be at least ₹1')
    .max(100000, 'Amount cannot exceed ₹100,000'),
  
  phone: z
    .string()
    .nonempty('Phone number is required')
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Phone number must start with 6-9 and be 10 digits'),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
});

// Type inference from schema
export type PaymentFormData = z.infer<typeof paymentSchema>;

// Form errors type
export type FormErrors = {
  amount?: string;
  phone?: string;
  email?: string;
};

// Helper function to extract error messages
export const getValidationErrors = (error: z.ZodError): FormErrors => {
  const errors: FormErrors = {};
  
  error.issues.forEach((err) => {
    const field = err.path[0] as keyof FormErrors;
    if (field) {
      errors[field] = err.message;
    }
  });
  
  return errors;
};

// Validate individual field
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  field: keyof T,
  value: any
): string | undefined => {
  try {
    const fieldSchema = z.object({
      [field]: (schema as any).shape[field]
    });
    fieldSchema.parse({ [field]: value });
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message;
    }
    return 'Validation error';
  }
};