<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false
});

const emits = defineEmits(['click']);
</script>

<template>
  <button 
    class="base-button" 
    :class="[variant, size, { loading, disabled }]"
    :disabled="disabled || loading"
    @click="emits('click', $event)"
  >
    <div v-if="loading" class="spinner"></div>
    <span v-else class="button-content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  gap: var(--space-sm);
  outline: none;
}

.base-button:active {
  transform: scale(0.98);
}

/* Variants */
.primary {
  background: var(--color-primary);
  color: #111;
}
.primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.3);
}

.secondary {
  background: var(--color-glass);
  border-color: var(--color-glass-border);
  color: var(--color-text-main);
}
.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.danger {
  background: var(--color-danger);
  color: white;
}

.ghost {
  background: transparent;
  color: var(--color-text-main);
}
.ghost:hover:not(:disabled) {
  background: var(--color-glass);
}

/* Sizes */
.sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
.md { padding: 0.7rem 1.4rem; font-size: 0.95rem; }
.lg { padding: 1rem 2rem; font-size: 1.1rem; }

/* States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
