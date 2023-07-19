<template>
  <div class="floatingElements">
    <CargoBlockMoving v-if="cargo" :cargo="cargo" />
    <CargoBlockAllocatedDropdown v-if="uldDropdown" />
    <CargoBlockToAllocateDropdown v-if="changeAllocationDropdown" />
    <CargoBlockConnected
      v-for="position of connectedUlds"
      :key="position"
      :position="position"
    />
    <ValidationPopover v-if="validationPopover" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import CargoBlockMoving from '@/components/CargoBlockMoving.vue';
import CargoBlockConnected from '@/components/CargoBlockConnected.vue';
import CargoBlockAllocatedDropdown from '@/components/CargoBlockAllocatedDropdown.vue';
import CargoBlockToAllocateDropdown from '@/components/CargoBlockToAllocateDropdown.vue';
import ValidationPopover from '@/components/ValidationPopover.vue';

export default defineComponent({
  components: {
    CargoBlockMoving,
    CargoBlockConnected,
    CargoBlockAllocatedDropdown,
    CargoBlockToAllocateDropdown,
    ValidationPopover,
  },
  computed: {
    cargo() {
      return this.$store.state.cargo.movingCargo;
    },
    connectedUlds() {
      return this.$store.state.cargo.connectedCargos?.positions ?? [];
    },
    uldDropdown() {
      return this.$store.state.misc.uldDropdown;
    },
    changeAllocationDropdown() {
      return this.$store.state.misc.changeAllocationDropdown;
    },
    validationPopover() {
      return this.$store.state.misc.validationMessagePopover;
    },
  },
});
</script>
>
