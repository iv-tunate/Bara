import { Script } from "./script";
export interface Address {
  city: string;
  country: string;
  state: string;
  street: string;
  postalCode?: string;
  additionalDetails?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  currency: string;
  currencySymbol: string;
}

export interface AuthProfile {
  isEmailVerified: boolean;
  isVerified: boolean;
  role: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name:string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  bio: string;
  gender: string;
  dateOfBirth: string;
  isBlacklisted: boolean;
  isDeleted: boolean;
  verificationStatus: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  portfolioUrl?: string;
  address: Address;
  wallet: Wallet;
  authProfile: AuthProfile;
  type: "Writer" | "Producer";
  createdAt: string;
  modifiedAt: string;
}

export interface BioExperience {
  id: string;
  organization: string;
  project: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  genre: string;
  ipDealType: string;
  paymentType: string;
  sharePercentage: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  currencySymbol: string;
}

export interface Writer extends User {
  isPremium: boolean;
  experiences: BioExperience[];
  services: ServiceDetail[];
}

export interface Producer extends User {
  purchasedScripts: Script[];
}
