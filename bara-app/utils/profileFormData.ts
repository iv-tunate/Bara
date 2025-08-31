export interface ProducerFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  dateOfBirth: string; // YYYY-MM-DD format
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
  
  // Address
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  additionalDetails?: string;
  
  // Document
  documentType: 'BVN' | 'NIN' | 'DRIVERS_LICENSE' | 'INTERNATIONAL_PASSPORT';
  verificationNumber: string;
  documentFile: File;
}

export interface WriterFormData extends ProducerFormData {
  isPremiumMember?: boolean;
  experiences: Array<{
    title: string;
    description: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
  }>;
  services?: Array<{
    name: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    currency: 'NGN' | 'USD';
  }>;
}


export function createProducerFormData(data: ProducerFormData): FormData {
  const formData = new FormData();
  
  // Personal info
  formData.append('FirstName', data.firstName);
  formData.append('LastName', data.lastName);
  if (data.middleName) formData.append('MiddleName', data.middleName);
  formData.append('PhoneNumber', data.phoneNumber);
  formData.append('DateOfBirth', data.dateOfBirth);
  formData.append('Gender', data.gender);
  if (data.bio) formData.append('Bio', data.bio);
  
  // Address 
  formData.append('AddressDetail.Street', data.street);
  formData.append('AddressDetail.City', data.city);
  formData.append('AddressDetail.State', data.state);
  formData.append('AddressDetail.Country', data.country);
  if (data.postalCode) formData.append('AddressDetail.PostalCode', data.postalCode);
  if (data.additionalDetails) formData.append('AddressDetail.AdditionalDetails', data.additionalDetails);
  
  // Document
  formData.append('VerificationDocument.Type', data.documentType);
  formData.append('VerificationDocument.VerificationNumber', data.verificationNumber);
  formData.append('VerificationDocument.Document', data.documentFile);
  
  return formData;
}

export function createWriterFormData(data: WriterFormData): FormData {
  const formData = new FormData();
  
  formData.append('FirstName', data.firstName);
  formData.append('LastName', data.lastName);
  if (data.middleName) formData.append('MiddleName', data.middleName);
  formData.append('PhoneNumber', data.phoneNumber);
  formData.append('DateOfBirth', data.dateOfBirth);
  formData.append('Gender', data.gender);
  if (data.bio) formData.append('Bio', data.bio);
  if (data.isPremiumMember !== undefined) formData.append('IsPremiumMember', data.isPremiumMember.toString());
  
  // Address 
  formData.append('AddressDetail.Street', data.street);
  formData.append('AddressDetail.City', data.city);
  formData.append('AddressDetail.State', data.state);
  formData.append('AddressDetail.Country', data.country);
  if (data.postalCode) formData.append('AddressDetail.PostalCode', data.postalCode);
  if (data.additionalDetails) formData.append('AddressDetail.AdditionalDetails', data.additionalDetails);
  
  // Document 
  formData.append('VerificationDocument.Type', data.documentType);
  formData.append('VerificationDocument.VerificationNumber', data.verificationNumber);
  formData.append('VerificationDocument.Document', data.documentFile);
  
  // Experiences 
  if (data.experiences && data.experiences.length > 0) {
    data.experiences.forEach((exp, index) => {
      formData.append(`Experiences[${index}].Title`, exp.title);
      formData.append(`Experiences[${index}].Description`, exp.description);
      if (exp.organization) formData.append(`Experiences[${index}].Organization`, exp.organization);
      if (exp.startDate) formData.append(`Experiences[${index}].StartDate`, exp.startDate);
      if (exp.endDate) formData.append(`Experiences[${index}].EndDate`, exp.endDate);
    });
  }
  
  // Services 
  if (data.services && data.services.length > 0) {
    data.services.forEach((service, index) => {
      formData.append(`PostServiceDetail[${index}].Name`, service.name);
      formData.append(`PostServiceDetail[${index}].Description`, service.description);
      formData.append(`PostServiceDetail[${index}].MinPrice`, service.minPrice.toString());
      formData.append(`PostServiceDetail[${index}].MaxPrice`, service.maxPrice.toString());
      formData.append(`PostServiceDetail[${index}].Currency`, service.currency);
    });
  }
  
  return formData;
}

export function validateProducerData(data: Partial<ProducerFormData>): string[] {
  const errors: string[] = [];
  
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.phoneNumber?.trim()) errors.push('Phone number is required');
  if (!data.dateOfBirth) errors.push('Date of birth is required');
  if (!data.gender) errors.push('Gender is required');
  if (!data.street?.trim()) errors.push('Street address is required');
  if (!data.city?.trim()) errors.push('City is required');
  if (!data.state?.trim()) errors.push('State is required');
  if (!data.country?.trim()) errors.push('Country is required');
  if (!data.documentType) errors.push('Document type is required');
  if (!data.verificationNumber?.trim()) errors.push('Verification number is required');
  if (!data.documentFile) errors.push('Document file is required');
  
  return errors;
}

export function validateWriterData(data: Partial<WriterFormData>): string[] {
  const errors = validateProducerData(data);
  
  if (data.experiences && data.experiences.length > 0) {
    data.experiences.forEach((exp, index) => {
      if (!exp.title?.trim()) errors.push(`Experience ${index + 1}: Title is required`);
      if (!exp.description?.trim()) errors.push(`Experience ${index + 1}: Description is required`);
    });
  }
  
  if (data.services && data.services.length > 0) {
    data.services.forEach((service, index) => {
      if (!service.name?.trim()) errors.push(`Service ${index + 1}: Name is required`);
      if (!service.description?.trim()) errors.push(`Service ${index + 1}: Description is required`);
      if (service.minPrice <= 0) errors.push(`Service ${index + 1}: Min price must be greater than 0`);
      if (service.maxPrice <= 0) errors.push(`Service ${index + 1}: Max price must be greater than 0`);
      if (service.minPrice > service.maxPrice) errors.push(`Service ${index + 1}: Min price cannot be greater than max price`);
    });
  }
  
  return errors;
}
