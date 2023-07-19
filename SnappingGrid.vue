<template>
  <div class="grids">
    <div
      v-for="[gridType, points] in grids"
      :key="gridType"
      :style="{ display: currentCargoType === gridType ? 'block' : 'none' }"
      class="grid"
    >
      <SnappingGridPoint v-for="(point, index) in points" :key="index" :point="point" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

import SnappingGridPoint from '@/components/SnappingGridPoint.vue';

export default defineComponent({
  components: { SnappingGridPoint },
  computed: {
    grids() {
      return Object.entries(this.$store.state.dom.grids);
    },

    currentCargoType() {
      return this.$store.state.cargo.movingCargo?.allocation.type.toLowerCase();
    },
  },
});
</script>
