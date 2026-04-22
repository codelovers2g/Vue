<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/userStore';


const route = useRoute();
const userStore = useUserStore();

const tabs = [
  { path: '/inventory', name: 'inventory', label: 'Inventory', icon: '📦' },
  { path: '/analytics', name: 'analytics', label: 'Intelligence', icon: '📊' }
];
</script>

<template>
  <div class="app-layout">
    <!-- Global Navigation Architecture -->
    <nav class="app-nav">
      <div class="navigation-brand">

        <span class="brand-name">VueIntelligence</span>
      </div>
      
      <div class="nav-links">
        <router-link 
          v-for="tab in tabs" 
          :key="tab.name"
          :to="tab.path"
          class="nav-item" 
          v-slot="{ isActive }"
        >
          <div class="nav-item-content" :class="{ active: isActive }">
            <span class="nav-icon">{{ tab.icon }}</span>
            <span class="nav-label">{{ tab.label }}</span>
            <div v-if="isActive" class="active-indicator"></div>
          </div>
        </router-link>
      </div>

      <div class="nav-footer">
        <div class="user-profile">
          <div class="avatar" :style="{ background: userStore.profile.avatarColor }">
            {{ userStore.profile.initials }}
          </div>
          <div class="user-info">
            <span class="name">{{ userStore.profile.name }}</span>
            <span class="role">{{ userStore.profile.role }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- View Layer -->
    <main class="app-main">
      <div class="view-container">
        <transition name="view-fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg-deep);
  color: var(--color-text-main);
  overflow: hidden;
}

.app-nav {
  width: 280px;
  background: rgba(15, 15, 15, 0.8);
  border-right: 1px solid var(--color-glass-border);
  display: flex;
  flex-direction: column;
  padding: var(--space-xl) var(--space-md);
  backdrop-filter: blur(20px);
  z-index: 10;
}

.navigation-brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding: 0 var(--space-md);
}


.brand-name {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, #fff 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.nav-item {
  text-decoration: none;
  color: inherit;
}

.nav-item-content {
  width: 100%;
  padding: 0.8rem 1rem;
  background: transparent;
  border-radius: 12px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-item-content:hover {
  background: var(--color-glass);
  color: var(--color-text-main);
}

.nav-item-content.active {
  background: rgba(66, 184, 131, 0.1);
  color: var(--color-primary);
}

.active-indicator {
  position: absolute;
  left: 0;
  width: 4px;
  height: 20px;
  background: var(--color-primary);
  border-radius: 0 4px 4px 0;
}

.nav-icon { font-size: 1.2rem; }
.nav-label { font-weight: 600; font-size: 0.95rem; }

.nav-footer {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-glass-border);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
}

.avatar {
  width: 40px;
  height: 40px;
  background: var(--color-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.user-info { display: flex; flex-direction: column; }
.user-info .name { font-weight: 600; font-size: 0.9rem; }
.user-info .role { font-size: 0.75rem; color: var(--color-text-muted); }

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
  background: radial-gradient(circle at top right, rgba(66, 184, 131, 0.03), transparent 40%);
}

.view-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Transitions */
.view-fade-enter-active, .view-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.view-fade-enter-from { opacity: 0; transform: translateX(10px); }
.view-fade-leave-to { opacity: 0; transform: translateX(-10px); }
</style>
