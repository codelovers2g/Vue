<template>
  <div class="controlsUnloadDropdown">
    <button
      class="text-proxima-semibold controlsUnloadDropdown_header"
      @mousedown="handleHeaderClick"
    >
      <img
        alt=""
        class="controlsUnloadDropdown_img"
        src="./assets/images/arrow-left.svg"
      />
      <span>{{ header }}</span>
    </button>
    <button
      v-for="category in categories"
      :key="category"
      class="text-proxima controlsScaleDropdown"
      @mousedown="handleClick(category)"
    >
      <span>{{ category }}</span>
      <img v-if="!selectedCategory" alt="" src="./assets/images/chevron-right.svg" />
    </button>
  </div>
</template>

<script lang="ts">
import { dispatchUnloadEvent } from '@/constants/functions';
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['click'],
  data() {
    return { selectedCategory: null as string | null };
  },
  computed: {
    header() {
      return this.selectedCategory ?? 'Unload by';
    },
    categories() {
      if (this.selectedCategory) {
        return this.$store.state.misc.unloadOptions[this.selectedCategory];
      }

      return Object.keys(this.$store.state.misc.unloadOptions);
    },
  },
  methods: {
    handleClick(category: string) {
      if (this.selectedCategory) {
        dispatchUnloadEvent(this.$store.state.dom.shadowRoot, {
          key: this.selectedCategory,
          value: category,
        });

        this.$emit('click');
      }

      this.selectedCategory = category;
    },
    handleHeaderClick() {
      if (this.selectedCategory) {
        this.selectedCategory = null;
        return;
      }

      this.$emit('click');
    },
  },
});
</script>
>
