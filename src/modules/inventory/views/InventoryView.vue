<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, useId } from 'vue';
import { useInventoryStore } from '../store/inventoryStore';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const store = useInventoryStore();
const searchQuery = ref('');
const newProductName = ref('');

// useTemplateRef: Clean, type-safe alternative to legacy string refs.
const inputRef = useTemplateRef<HTMLInputElement>('product-input');

// useId: Standardized utility for accessible and stable element IDs.
const searchInputId = useId();

const filteredProducts = computed(() => {
  return store.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleAddProduct = () => {
  if (!newProductName.value.trim()) return;
  store.addProduct(newProductName.value);
  newProductName.value = '';
  inputRef.value?.focus();
};

onMounted(() => {
  if (store.products.length === 0) {
    store.initializeProducts();
  }
});
</script>

<template>
  <div class="inventory-view">
    <header class="view-header">
      <div class="title-area">
        <h1>Inventory Management</h1>
        <p class="subtitle">Manage and track your premium product stock</p>
      </div>
      <div class="header-actions">
        <div class="stat-pill">
          <span class="label">Total Products</span>
          <span class="value">{{ store.products.length }}</span>
        </div>
      </div>
    </header>

    <div class="grid-layout">
      <!-- Search & Add Sidebar -->
      <aside class="sidebar">
        <BaseCard title="Quick Actions">
          <div class="form-group">
            <label :for="searchInputId">Search Inventory</label>
            <input 
              :id="searchInputId"
              v-model="searchQuery" 
              type="text" 
              placeholder="Filter by name..." 
              class="premium-input"
            />
          </div>

          <div class="form-group mt-xl">
            <label>New Product</label>
            <div class="flex-column gap-md">
              <input 
                ref="product-input"
                v-model="newProductName" 
                type="text" 
                placeholder="Name..." 
                class="premium-input"
                @keyup.enter="handleAddProduct"
              />
              <BaseButton @click="handleAddProduct" block>
                Add Inventory
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </aside>

      <!-- Products Table/Grid -->
      <main class="main-content">
        <transition name="fade" mode="out-in">
          <div v-if="store.isLoading" class="loading-state">
            <div class="shimmer-card" v-for="i in 3" :key="i"></div>
          </div>
          
          <div v-else-if="filteredProducts.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No Products Found</h3>
            <p>Try adjusting your search query or add a new item.</p>
          </div>

          <div v-else class="product-list">
            <TransitionGroup name="list">
              <div 
                v-for="product in filteredProducts" 
                :key="product.id" 
                class="product-row-card"
              >
                <div class="product-main">
                  <div class="cat-tag">{{ product.category }}</div>
                  <h3>{{ product.name }}</h3>
                  <span class="price">${{ product.price }}</span>
                </div>
                
                <div class="product-meta">
                  <div class="stock-indicator" :class="{ 'low-stock': product.stock < 10 }">
                    <span class="stock-label">Stock level</span>
                    <div class="stock-bar">
                      <div class="fill" :style="{ width: Math.min(product.stock * 2, 100) + '%' }"></div>
                    </div>
                    <span class="stock-count">{{ product.stock }} units</span>
                  </div>
                </div>

                <div class="product-ops">
                  <BaseButton variant="ghost" size="sm" @click="store.removeProduct(product.id)">
                    Delete
                  </BaseButton>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
.inventory-view {
  animation: fadeIn 0.6s var(--ease-premium);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.stat-pill {
  background: var(--color-glass);
  padding: 0.5rem 1.2rem;
  border-radius: 100px;
  border: 1px solid var(--color-glass-border);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat-pill .label { color: var(--color-text-muted); font-size: 0.85rem; }
.stat-pill .value { font-weight: 700; color: var(--color-primary); }

.grid-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-xl);
}

.premium-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-glass-border);
  border-radius: 8px;
  color: white;
  transition: all var(--transition-fast);
}

.premium-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-sm);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.mt-xl { margin-top: var(--space-xl); }
.flex-column { display: flex; flex-direction: column; }
.gap-md { gap: var(--space-md); }

/* Product Row Cards */
.product-row-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-glass-border);
  border-radius: 12px;
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform var(--transition-fast), border-color var(--transition-fast);
}

.product-row-card:hover {
  transform: translateX(8px);
  border-color: var(--color-primary);
}

.product-main { flex: 1; }
.cat-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
}

.product-main h3 { margin-bottom: var(--space-xs); font-size: 1.1rem; }
.price { font-weight: 800; color: var(--color-text-main); font-size: 1.2rem; }

.product-meta { flex: 1; padding: 0 var(--space-xl); }
.stock-indicator { display: flex; flex-direction: column; gap: 4px; }
.stock-label { font-size: 0.75rem; color: var(--color-text-muted); }
.stock-bar {
  height: 6px;
  background: var(--color-glass);
  border-radius: 3px;
  width: 150px;
  overflow: hidden;
}
.stock-bar .fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 1s ease;
}
.stock-indicator.low-stock .fill { background: var(--color-danger); }
.stock-count { font-size: 0.8rem; font-weight: 600; }

.loading-state { display: flex; flex-direction: column; gap: var(--space-md); }
.shimmer-card {
  height: 100px;
  background: linear-gradient(90deg, #1e1e1e 25%, #2a2a2a 50%, #1e1e1e 75%);
  background-size: 400% 100%;
  animation: shimmer 2s infinite;
  border-radius: 12px;
}

@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

.list-enter-active, .list-leave-active { transition: all 0.4s var(--ease-premium); }
.list-enter-from { opacity: 0; transform: translateY(20px); }
.list-leave-to { opacity: 0; transform: scale(0.95); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
