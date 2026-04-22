import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface UserProfile {
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
}

/**
 * Global store for user-related state and identity management.
 */
export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile>({
    name: 'Admin User',
    role: 'Enterprise Pro',
    initials: 'AD',
    avatarColor: 'var(--color-accent)'
  });

  return {
    profile
  };
});
