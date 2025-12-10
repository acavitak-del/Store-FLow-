export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minLevel: number;
  price: number;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  timestamp: number;
  notes?: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  TRANSACTION = 'TRANSACTION', // Reception View
  AI_EDITOR = 'AI_EDITOR'
}
