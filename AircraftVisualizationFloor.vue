<template>
  <div class="floor" :style="style">
    <div class="floor_cargo">
      <template v-for="cargo in cargos" :key="cargo.uldNumber">
        <CargoBlockAllocated :cargo="cargo" ref="cargo" />
      </template>
      <template v-for="[position, bulkCargo] in bulkCargos" :key="position">
        <CargoBlockAllocatedBulk
          v-if="bulkCargo.length > 0"
          :cargos="bulkCargo"
          :position="position"
        />
      </template>
    </div>
    <div class="floor_holds">
      <template v-for="hold in floor" :key="hold.code">
        <AircraftVisualizationPosition
          v-for="position in hold.configuration.positions"
          :key="position.iataCode"
          :position="position"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import AircraftVisualizationPosition from '@/components/AircraftVisualizationPosition.vue';
import CargoBlockAllocated from '@/components/CargoBlockAllocated.vue';
import CargoBlockAllocatedBulk from '@/components/CargoBlockAllocatedBulk.vue';

export default defineComponent({
  components: {
    AircraftVisualizationPosition,
    CargoBlockAllocated,
    CargoBlockAllocatedBulk,
  },
  props: {
    floor: {
      type: Object as PropType<Aircraft.Hold>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  computed: {
    cargos() {
      return this.$store.state.cargo.allocatedCargos?.[this.index];
    },
    bulkCargos() {
      const bulkCargos = Object.entries(
        this.$store.state.cargo.allocatedBulkCargos?.[this.index]
      );
      return bulkCargos;
    },
    planeLength() {
      if (!this.$store.state.aircraft.aircraft) {
        return 2729;
      }

      return (
        this.$store.state.aircraft.aircraft.length +
        this.$store.state.aircraft.aircraft.datumOffset
      );
    },
    planeOffset() {
      if (!this.$store.state.aircraft.aircraft) {
        return 90;
      }
      return this.$store.state.aircraft.aircraft?.datumOffset;
    },
    planeWidth() {
      if (!this.$store.state.aircraft.aircraft) {
        return 256;
      }

      return this.$store.state.aircraft.aircraft.width;
    },
    sizeStyles() {
      return {
        height: `${this.planeWidth * this.$store.state.dom.scale}px`,
        width: `${this.planeLength * this.$store.state.dom.scale}px`,
      };
    },
    backgroundStyles() {
      return {
        backgroundSize: `calc(100% - ${
          this.planeOffset * this.$store.state.dom.scale
        }px) 100%`,
      };
    },
    style() {
      return {
        ...this.sizeStyles,
        ...this.backgroundStyles,
      };
    },
  }
});
</script>
