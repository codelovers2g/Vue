<template>
  <div
    ref="cargo"
    class="cargoBlockToAllocate"
    :style="style"
    :class="{
      cargoBlockToAllocate___moving: moving,
    }"
    @mousedown.prevent="handleMouseDown($event)"
  >
    <hr class="cargoBlockToAllocate_line" />
    <div class="cargoBlockToAllocate_content">
      <div class="cargoBlockToAllocate_top">
        <div>
          <p class="text-proxima-bold cargoBlockToAllocate_text">
            {{ cargo.uldNumber }}
          </p>
          <p class="text-proxima-bold cargoBlockToAllocate_text___weight">
            {{ cargo.weight }} kg
          </p>
        </div>
        <p class="text-proxima-bold cargoBlockToAllocate_text">
          {{ cargo.destination }}
        </p>
      </div>
      <div class="cargoBlockToAllocate_bottom">
        <p class="text-proxima-bold cargoBlockToAllocate_text">{{ cargo.contour }}</p>
        <div class="cargoBlockToAllocate_allocation">
          <p class="text-proxima-bold cargoBlockToAllocate_text">
            {{ readableAllocationType }}
          </p>
          <button
            class="text-proxima-bold cargoBlockToAllocate_allocationButton"
            @mousedown.stop.prevent="toggleDropdown"
          >
            <img
              alt=""
              class="cargoBlockToAllocate_img"
              src="./assets/images/chevron-up.svg"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { readableAllocationType } from '@/constants/functions';

import { CargoActionTypes } from '@/store/cargo.types';
import { MiscMutationTypes } from '@/store/misc.types';

export default defineComponent({
  props: {
    cargo: {
      type: Object as PropType<Cargo.Cargo>,
      required: true,
    },
  },
  data() {
    return {
      newAllocationType: null as string | null,
    };
  },
  computed: {
    style() {
      const { destination } = this.cargo;
      return {
        '--color-destination':
          this.$store.state.misc.destinationOptions[destination] ??
          'var(--color-primary-midnight-blue)',
      };
    },
    moving() {
      return this.$store.state.cargo.movingCargo?.uldNumber === this.cargo.uldNumber;
    },
    readableAllocationType() {
      return readableAllocationType(this.cargo.allocation.type);
    },
  },
  methods: {
    toggleDropdown() {
      if (!this.$store.state.misc.changeAllocationDropdown) {
        this.$store.commit(MiscMutationTypes.SET_CHANGE_ALLOCATION_DROPDOWN, {
          uldNumber: this.cargo.uldNumber,
          fromType: this.cargo.allocation.type,
          DOMRect: (this.$refs.cargo as HTMLElement).getBoundingClientRect(),
        });
        return;
      }

      this.$store.commit(MiscMutationTypes.SET_CHANGE_ALLOCATION_DROPDOWN, null);
    },
    handleMouseDown(event:any) {
      this.$store.commit(MiscMutationTypes.SET_CHANGE_ALLOCATION_DROPDOWN, null);
      this.$store.dispatch(CargoActionTypes.MOVE_CARGO, this.cargo);
    },
  },
});
</script>
