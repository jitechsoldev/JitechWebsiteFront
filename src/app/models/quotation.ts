// src/app/models/quotation.ts
export interface Quotation {
  quotationNumber: string;
  companyName: string;
  address: string;
  contactNo: string;
  tin: string;
  clientName: string;
  quotationDate: string;
  expiryDate: string;
  reference: string;
  salesPerson: string;
  paymentTerm: string;
  items?: QuotationItem[];
}

export interface QuotationItem {
  sku: string;
  productName: string;
  description?: string;
  qty: number;
  price: number;
  discount: number;
}
