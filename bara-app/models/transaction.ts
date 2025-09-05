export interface Transaction {
  id: string;
  amount: number;
  currencySymbol: string;
  status: string;
  transactionType: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
}
