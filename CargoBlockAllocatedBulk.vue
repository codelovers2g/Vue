<template>
  <div
    ref="cargo"
    class="cargoBlockAllocated___bulk"
    :style="style"
    draggable="true"
    @mousedown.stop="handleDivClick"
  >
    <div>
      <template v-for="uld in ulds" :key="uld">
        <p v-if="size.length > 50 || size.width >= 100" class="text-proxima-bold cargoBlockAllocated_text">
          {{ uld }}
        </p>
      </template>
      <p
        v-if="size.width > 60 && size.length > 50"
        class="text-proxima-bold cargoBlockAllocated_text"
      >
        {{ weight }}kg
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { CargoActionTypes } from '@/store/cargo.types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    cargos: {
      type: Object as PropType<Cargo.Cargo[]>,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showDropdown: false,
      dropdownItems: ['Unload', 'Offload', 'Details'],
    };
  },
  computed: {
    style() {
      const { DOMPosition } = this.positionData;

      return {
        left: `${DOMPosition.scaledCoordinates[0]}px`,
        top: `${DOMPosition.scaledCoordinates[1]}px`,
        width: `${DOMPosition.scaledLength}px`,
        height: `${DOMPosition.scaledWidth}px`,
      };
    },
    size() {
      const { DOMPosition } = this.positionData;

      return {
        length: DOMPosition.scaledLength,
        width: DOMPosition.scaledWidth,
      };
    },

    positionData() {
      if (!this.$store.state.aircraft.positions) {
        throw new TypeError('CargoBlockAllocatedBulk: No aircraft positions found');
      }

      const position: Aircraft.DOMPosition =
        this.$store.state.aircraft.positions[this.position];

      if (!position) {
        throw new TypeError(
          `CargoBlockAllocatedBulk: no position object found for iataCode: ${this.position}`
        );
      }

      return position;
    },

    ulds() {
      return this.cargos.map((cargo) => cargo.uldNumber);
    },

    weight() {
      return this.cargos.reduce((acc, curr) => acc + curr.weight, 0);
    },
  },
  methods: {
    handleDivClick() {
      this.$store.dispatch(CargoActionTypes.MOVE_CARGO, this.cargos[0] );
    },
  },
});
</script>
