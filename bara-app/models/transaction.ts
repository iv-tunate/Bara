export interface Transaction {
  id: string;
  amount: number;
  currencySymbol: string;
  status: string;
  transactionType: string;
  referenceId: string;
  transactionDate: string;
  gatewayResponse?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}
