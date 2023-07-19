<template>
  <div class="cargoBlockAllocated_dropdown" :style="style">
    <button
      v-for="allocationType in allocationTypes"
      :key="allocationType"
      class="text-proxima cargoBlockAllocated_dropdownItem"
      @mousedown="handleClick(allocationType)"
    >
      {{ allocationType }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';

import {
  dispatchChangePositionTypeEvent,
  actualAllocationType,
} from '@/constants/functions';
import { CargoMutationTypes } from '@/store/cargo.types';
import { MiscMutationTypes } from '@/store/misc.types';

export default defineComponent({
  setup() {
    return {
      mouseUpCount: inject('mouseUpCount') as number,
    };
  },
  data() {
    return {
      allocationTypes: [
        'Regular',
        'Connected (Lat)',
        'Connected (Long)',
        'Side',
        'Center',
        'Lateral',
        'Bulk',
      ],
      opened: false,
    };
  },
  computed: {
    style() {
      if (
        !this.$store.state.misc.changeAllocationDropdown ||
        !this.$store.state.dom.rootNode
      ) {
        return {
          display: 'none',
        };
      }

      const { right: uldRight, bottom: uldBottom } =
        this.$store.state.misc.changeAllocationDropdown.DOMRect;

      const { bottom: rootBottom, right: rootRight } =
        this.$store.state.dom.rootNode.getBoundingClientRect();

      const right = rootRight - uldRight;
      const bottom = rootBottom - uldBottom;

      return {
        right: `${right}px`,
        bottom: `${bottom}px`,
      };
    },

    changeAllocationDropdown() {
      return this.$store.state.misc.changeAllocationDropdown;
    },
  },
  watch: {
    mouseUpCount(): void {
      if (!this.opened && this.$store.state.misc.changeAllocationDropdown) {
        this.opened = true;
        return;
      }

      this.opened = false;
      this.$store.commit(MiscMutationTypes.SET_CHANGE_ALLOCATION_DROPDOWN, null);
    },
  },

  methods: {
    handleClick(newAllocationType: Cargo.Cargo['allocation']['type']) {
      if (!this.changeAllocationDropdown) {
        return;
      }

      this.$store.commit(CargoMutationTypes.CHANGE_CARGO_ALLOCATION_TYPE, {
        uldNumber: this.changeAllocationDropdown.uldNumber,
        newAllocationType: actualAllocationType(newAllocationType),
      });

      dispatchChangePositionTypeEvent(this.$store.state.dom.shadowRoot, {
        uldNumber: this.changeAllocationDropdown.uldNumber,
        fromType: this.changeAllocationDropdown.fromType,
        newType: actualAllocationType(newAllocationType),
      });
    },
  },
});
</script>
>
