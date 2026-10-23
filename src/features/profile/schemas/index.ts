import { z } from 'zod';

export const nameRegex = /^[a-zA-Z\s]+$/;

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .regex(nameRegex, 'First name must contain only letters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .regex(nameRegex, 'Last name must contain only letters'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => {
        const birthDate = new Date(val);
        const today = new Date();
        return birthDate <= today;
      },
      { message: 'Date of birth cannot be in the future' }
    ),
  gender: z.enum(['Male', 'Female', 'Other'], {
    message: 'Gender is required',
  }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
