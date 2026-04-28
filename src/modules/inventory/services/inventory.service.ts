import type { Product } from '../models/product.model';

export const InventoryService = {
  //Fetches the initial set of products.

  async fetchProducts(): Promise<Product[]> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      { id: 1, name: 'Premium Wireless Headphones', price: 299, stock: 15, category: 'Electronics', lastUpdated: '2026-04-10' },
      { id: 2, name: 'Mechanical Gaming Keyboard', price: 159, stock: 42, category: 'Accessories', lastUpdated: '2026-04-12' },
      { id: 3, name: '4K UltraWide Monitor', price: 599, stock: 8, category: 'Electronics', lastUpdated: '2026-04-15' },
      { id: 4, name: 'Ergonomic Office Chair', price: 349, stock: 25, category: 'Furniture', lastUpdated: '2026-04-17' },
      { id: 5, name: 'USB-C Docking Station', price: 129, stock: 5, category: 'Accessories', lastUpdated: '2026-04-18' },
    ];
  },

  async addProduct(name: string): Promise<Product> {
    // Simulate fast API response
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: Date.now(),
      name,
      price: Math.floor(Math.random() * 500) + 50,
      stock: Math.floor(Math.random() * 50) + 1,
      category: ['Electronics', 'Accessories', 'Furniture'][Math.floor(Math.random() * 3)],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
};
