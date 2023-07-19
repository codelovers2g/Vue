<template>
  <div class="validationPopover" :style="style">
    <h2 class="text-proxima-semibold validationPopover_h2">
      {{ validation.severity }}
    </h2>
    <p class="text-proxima-semibold validationPopover_p">{{ validation.message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  computed: {
    validation() {
      if (!this.$store.state.misc.validationMessagePopover) {
        throw new TypeError('ValidationPopover: expected validation message popover');
      }

      return this.$store.state.misc.validationMessagePopover?.validation;
    },
    style() {
      if (
        !this.$store.state.misc.validationMessagePopover ||
        !this.$store.state.dom.rootNode
      ) {
        return {
          display: 'none',
        };
      }

      const {
        left: uldLeft,
        bottom: uldBottom,
        width: uldWidth,
      } = this.$store.state.misc.validationMessagePopover.DOMRect;

      const { bottom: rootBottom, left: rootLeft } =
        this.$store.state.dom.rootNode.getBoundingClientRect();

      const left = uldLeft - rootLeft + uldWidth + 10;
      const bottom = rootBottom - uldBottom - 10;

      return {
        left: `${left}px`,
        bottom: `${bottom}px`,
      };
    },
  },
});
</script>
>
