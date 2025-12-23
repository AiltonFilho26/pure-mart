export interface Product {
  id: number;
  name: string;
  price: number;
}

export const products: Product[] = [
  { id: 1, name: 'Teclado Mecânico', price: 150 },
  { id: 2, name: 'Mouse Gamer', price: 80 },
  { id: 3, name: 'Monitor 144hz', price: 1200 },
];