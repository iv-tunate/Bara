export type IPDealType =
  | "WriterRetainsRights"
  | "ProducerRetainsRights"
  | "SharedRights";

export interface Script {
  id: string;
  title: string;
  price: number;
  image?: string; 
  logline: string;
  synopsis: string;
  genre: string;
  writerId?: string; 
  writerName: string;
  status: string; 
  currency: string;
  currencySymbol: string;
  ownershipRights?: IPDealType | null; 
  proofUrl?: string;
  copyrightNumber?: string;
  isScriptRegistered: boolean;
  registrationBody?: string;
  url: string;
  path: string;
  uploadedOn: string;
}


export const ownershipLabels: Record<IPDealType, string> = {
  WriterRetainsRights: "IP owned by writer",
  ProducerRetainsRights: "IP owned by producer",
  SharedRights: "IP shared between writer and producer",
};
