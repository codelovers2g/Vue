<template>
  <button class="text-proxima controlsScaleDropdown" @mousedown="setScale">
    <span>Zoom to {{ readableScale() }}%</span>
    <img src="./assets/images/check.svg" alt="Selected" :style="imageStyle" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    scale: {
      type: Number,
      required: true,
    },
    setScale: {
      type: Function,
      required: true,
    },
  },
  computed: {
    imageStyle() {
      return {
        visibility: this.$store.state.dom.scale === this.scale ? undefined : 'hidden',
      };
    },
  },
  methods: {
    readableScale() {
      return Math.round((this.scale + Number.EPSILON) * 100);
    },
  },
});
</script>
>
