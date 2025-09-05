export interface WriterProfile {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  bio?: string;
  phoneNumber: string;
  profilePicture?: string;
  isPremiumMember: boolean;
  verificationStatus: string;
  addressDetail: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  scripts: Array<{
    id: string;
    title: string;
    genre: string;
    synopsis: string;
    price: number;
    currencySymbol: string;
    status: string;
  }>;
  experiences: Array<{
    title: string;
    description: string;
    organization?: string;
  }>;
  services: Array<{
    name: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    currency: string;
  }>;
}
