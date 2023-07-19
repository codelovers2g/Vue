<template>
  <div class="point" :style="positionStyles" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    point: {
      type: Object as PropType<Grid.DOMPoint>,
      required: true,
    },
  },
  computed: {
    positionStyles() {
      return {
        left: `${this.point.normalizedLongitudinalCoordinate}px`,
        top: `${this.point.normalizedLateralCoordinate}px`,
      };
    },
  },
});
</script>
