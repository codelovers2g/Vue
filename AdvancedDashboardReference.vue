<!--
  ================================================================
  Tool Name: Vue.js
  Latest Version Used: 3.5.32
  File Purpose: Advanced CRUD & Dashboard Reference
  Created Date: 2026-04-17
  Status: LATEST VERSION REFERENCE
  ================================================================
-->

<script setup>
import { 
  ref, 
  reactive, 
  computed, 
  onMounted, 
  useId, 
  useTemplateRef, 
  watchEffect,
  defineModel 
} from 'vue';

// Latest Patterns: defineModel for two-way binding (Vue 3.4+)
const modalVisible = defineModel('visible', { default: false });

// PROPS DEFINITION
const props = defineProps({
  title: { type: String, default: 'Product Inventory Dashboard' },
  initialLimit: { type: Number, default: 10 }
});

/**
 * Demonstrating Vue 3.5+ Patterns:
 * 1. Reactive Props Destructuring: No more 'toRefs(props)' needed.
 * 2. useTemplateRef: Compile-time safe reference to DOM elements.
 * 3. useId: Stable, SSR-safe unique ID generation for accessibility.
 * 4. Advanced watchEffect with cleanup and flush options.
 */
const { title, initialLimit } = props; // Reactive destructuring (3.5+)
const mainInput = useTemplateRef('product-input');
const componentId = useId();

const focusInput = () => mainInput.value?.focus();

// Efficient derived state using latest reactivity optimizations
const dashboardUid = computed(() => `db-${componentId}`);
const searchLabelId = `${dashboardUid.value}-search`;

watchEffect((onCleanup) => {
  const timeout = setTimeout(() => console.log(`Dashboard ${title} initialized`), 100);
  onCleanup(() => clearTimeout(timeout));
}, { flush: 'post' });
// ================================

// LOCAL STATE
const products = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const newProductName = ref('');

// CRUD OPERATIONS (Mocking API)
const fetchProducts = async () => {
  isLoading.value = true;
  try {
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 800));
    products.value = [
      { id: 1, name: 'Premium Wireless Headphones', price: 299, stock: 15 },
      { id: 2, name: 'Mechanical Gaming Keyboard', price: 159, stock: 42 },
      { id: 3, name: '4K UltraWide Monitor', price: 599, stock: 8 },
    ];
  } catch (err) {
    console.error('Failed to fetch:', err);
  } finally {
    isLoading.value = false;
  }
};

const addProduct = () => {
  if (!newProductName.value.trim()) return;
  
  const product = {
    id: Date.now(),
    name: newProductName.value,
    price: Math.floor(Math.random() * 500) + 50,
    stock: Math.floor(Math.random() * 50) + 1
  };
  
  products.value.unshift(product);
  newProductName.value = '';
  focusInput();
};

const deleteProduct = (id) => {
  products.value = products.value.filter(p => p.id !== id);
};

// COMPUTED SEARCH
const filteredProducts = computed(() => {
  return products.value.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div :id="dashboardUid" class="dashboard-container">
    <header class="dashboard-header">
      <h1>{{ title }}</h1>
      <div class="stats">
        <span class="badge">Total: {{ products.length }}</span>
        <span class="badge success">Active: {{ filteredProducts.length }}</span>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- Search & Controls -->
      <section class="controls-card">
        <div class="input-group">
          <label :for="searchLabelId">Search Products</label>
          <input 
            :id="searchLabelId"
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by name..."
            class="styled-input"
          />
        </div>

        <div class="input-group">
          <label>Add New Product</label>
          <div class="flex-row">
            <input 
              ref="product-input"
              v-model="newProductName" 
              type="text" 
              placeholder="Enter product name" 
              class="styled-input"
              @keyup.enter="addProduct"
            />
            <button @click="addProduct" class="btn primary">Add Product</button>
          </div>
        </div>
      </section>

      <!-- Product List -->
      <section class="list-section">
        <div v-if="isLoading" class="loader-overlay">
          <div class="spinner"></div>
          <p>Loading Inventory...</p>
        </div>

        <TransitionGroup name="list" tag="ul" class="product-grid">
          <li v-for="product in filteredProducts" :key="product.id" class="product-card">
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="price">${{ product.price }}</p>
              <p :class="['stock', product.stock < 10 ? 'low' : '']">
                Stock: {{ product.stock }} units
              </p>
            </div>
            <div class="product-actions">
              <button class="btn icon-btn edit" title="Edit">✏️</button>
              <button 
                class="btn icon-btn delete" 
                title="Delete"
                @click="deleteProduct(product.id)"
              >
                🗑️
              </button>
            </div>
          </li>
        </TransitionGroup>

        <div v-if="!isLoading && filteredProducts.length === 0" class="empty-state">
          <p>No products found matching your search.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
:root {
  --primary: #42b883;
  --primary-dark: #33a06f;
  --bg-dark: #1a1a1a;
  --card-bg: #242424;
  --text-main: #ffffff;
  --text-muted: #a0a0a0;
  --danger: #ff4d4d;
  --glass: rgba(255, 255, 255, 0.05);
}

.dashboard-container {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #121212;
  color: var(--text-main);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--glass);
  padding-bottom: 1rem;
}

.dashboard-header h1 {
  font-size: 1.8rem;
  background: linear-gradient(135deg, var(--primary), #35495e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.badge {
  padding: 0.4rem 0.8rem;
  background: var(--glass);
  border-radius: 20px;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.badge.success { border: 1px solid var(--primary); color: var(--primary); }

.controls-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.flex-row { display: flex; gap: 0.5rem; }

.styled-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: white;
  transition: all 0.3s ease;
}

.styled-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, opacity 0.2s;
}

.btn.primary { background: var(--primary); color: #1a1a1a; }
.btn:hover { transform: translateY(-2px); opacity: 0.9; }

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  list-style: none;
  padding: 0;
}

.product-card {
  background: var(--card-bg);
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  border-color: var(--primary);
  transform: scale(1.02);
  background: #2a2a2a;
}

.product-info h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
.price { color: var(--primary); font-weight: bold; font-size: 1.2rem; margin: 0; }
.stock { font-size: 0.85rem; color: var(--text-muted); }
.stock.low { color: var(--danger); font-weight: bold; }

.product-actions { display: flex; flex-direction: column; gap: 0.5rem; }

.icon-btn {
  background: var(--glass);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 1.2rem;
}

.icon-btn.delete:hover { background: rgba(255, 77, 77, 0.2); }

/* Animations */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from { opacity: 0; transform: translateX(30px); }
.list-leave-to { opacity: 0; transform: scale(0.5); }

.loader-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--glass);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
