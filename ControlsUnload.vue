<template>
  <button
    v-if="showOffload"
    class="text-proxima-semibold controlsUnload_offload"
    @click="handleOffloadClick"
  >
    <img alt="" class="controlsUnload_allImg" src="./assets/images/unload.svg" />
    <span>Offload all</span>
  </button>
  <button class="text-proxima-semibold controlsUnload_all" @click="handleUnloadClick">
    <img alt="" class="controlsUnload_allImg" src="./assets/images/unload.svg" />
    <span>Unload all</span>
  </button>
  <button class="controlsUnload_dropdown" @click="toggleDropdown">
    <img
      src="./assets/images/chevron-up.svg"
      alt="View more unload options"
      :style="imageStyle"
    />
  </button>

  <ControlsUnloadDropdown v-if="isDropdownOpen" @click="toggleDropdown" />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';

import ControlsUnloadDropdown from '@/components/ControlsUnloadDropdown.vue';

import { dispatchOffloadEvent, dispatchUnloadEvent } from '@/constants/functions';
export default defineComponent({
  components: {
    ControlsUnloadDropdown,
  },
  data() {
    return {
      isDropdownOpen: false,
      opened: false,
    };
  },
  computed: {
    showOffload() {
      return this.$store.state.misc.showOffload;
    },
    imageStyle() {
      if (this.isDropdownOpen) {
        return {
          transform: 'rotate(180deg)',
        };
      }

      return undefined;
    },
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    handleUnloadClick() {
      dispatchUnloadEvent(this.$store.state.dom.shadowRoot, {
        key: 'All',
        value: '',
      });
    },
    handleOffloadClick() {
      dispatchOffloadEvent(this.$store.state.dom.shadowRoot);
    },
  },
});
</script>
