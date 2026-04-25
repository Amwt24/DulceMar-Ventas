export interface Product {
  id: string;
  name: string;
  emoji: string;
  price: number;
  unit: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Sale {
  id?: string;
  total: number;
  items: SaleItem[];
  createdAt: Date;
}
