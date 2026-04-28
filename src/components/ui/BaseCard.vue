<script setup lang="ts">
defineProps<{
  title?: string;
  padding?: boolean;
}>();
</script>

<template>
  <div class="base-card" :class="{ 'has-padding': padding }">
    <header v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </header>
    <main class="card-content">
      <slot />
    </main>
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
  border-radius: 16px;
  overflow: hidden;
  transition: transform var(--transition-fast), border-color var(--transition-fast);
  box-shadow: var(--shadow-premium);
}

.base-card:hover {
  border-color: var(--color-primary);
}

.card-header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-glass-border);
}

.card-content {
  padding: var(--space-lg);
}

.has-padding .card-content {
  padding: var(--space-xl);
}

.card-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-glass-border);
  background: rgba(255, 255, 255, 0.02);
}
</style>
