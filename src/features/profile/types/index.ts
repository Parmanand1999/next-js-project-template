export interface ProfileData {
  _id?: string;
  firstName: string;
  lastName: string;
  bloodGroup: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  profilePhoto?: string[];
  contactNumber?: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
