<template>
  <div class="cargoBlockAllocated_dropdown" :style="style">
    <button
      v-for="dropdownItem in dropdownItems"
      :key="dropdownItem"
      class="text-proxima cargoBlockAllocated_dropdownItem"
      @mousedown="handleClick(dropdownItem)"
    >
      {{ dropdownItem }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { Vue } from 'vue-property-decorator';

import { dispatchULDActionEvent } from '@/constants/functions';
import { MiscMutationTypes } from '@/store/misc.types';

export default defineComponent({
  setup() {
    return {
      mouseUpCount: inject('mouseUpCount') as number,
    };
  },
  data() {
    return {
      dropdownItems: ['Unload', 'Offload', 'Details'],
      opened: false,
    };
  },
  computed: {
    style() {
      if (!this.$store.state.misc.uldDropdown || !this.$store.state.dom.rootNode) {
        return {
          display: 'none',
        };
      }

      const uldRect = this.$store.state.misc.uldDropdown.DOMRect;

      const { top: rootTop, right: rootRight } =
        this.$store.state.dom.rootNode.getBoundingClientRect();

      const right = rootRight - uldRect.right;
      const top = uldRect.top - rootTop + uldRect.height / 2;

      return {
        right: `${right}px`,
        top: `${top}px`,
      };
    },
    uldDropdown() {
      return this.$store.state.misc.uldDropdown;
    },
  },
  watch: {
    mouseUpCount(): void {
      if (!this.opened && this.$store.state.misc.uldDropdown) {
        this.opened = true;
        return;
      }

      this.opened = false;
      this.$store.commit(MiscMutationTypes.SET_ULD_DROPDOWN, null);
    },
  },
  methods: {
    handleClick(allocType: Events.ULDActionDetail['type']) {
      if (!this.uldDropdown) {
        return;
      }
      dispatchULDActionEvent(this.$store.state.dom.shadowRoot, {
        uldNumber: this.uldDropdown.uldNumber,
        type: allocType,
      });

      this.$store.commit(MiscMutationTypes.SET_ULD_DROPDOWN, null);
    },
  },
});
</script>

