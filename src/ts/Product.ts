export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  parcelamento: [number, number]
  date: string;
  quantity?: number;
  category: string;
}
