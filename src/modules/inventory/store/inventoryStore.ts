import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product } from '../models/product.model';
import { InventoryService } from '../services/inventory.service';

// Pinia Setup Store
export const useInventoryStore = defineStore('inventory', () => {
  const products = ref<Product[]>([]);
  const isLoading = ref(false);

  //Initializes state by fetching data from the service.
  const initializeProducts = async () => {
    isLoading.value = true;
    try {
      const data = await InventoryService.fetchProducts();
      products.value = data;
    } catch (error) {
      console.error('Failed to initialize products:', error);
    } finally {
      isLoading.value = false;
    }
  };

  //Adds a product
  const addProduct = async (name: string) => {
    try {
      const newProduct = await InventoryService.addProduct(name);
      products.value.unshift(newProduct);
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const removeProduct = (id: number) => {
    products.value = products.value.filter(p => p.id !== id);
  };

  const lowStockProducts = computed(() => products.value.filter(p => p.stock < 10));

  return {
    products,
    isLoading,
    initializeProducts,
    addProduct,
    removeProduct,
    lowStockProducts
  };
});
