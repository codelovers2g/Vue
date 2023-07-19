<template>
  <ControlsScale :parentChildMethod="Recenter" />
  <ControlsCenter />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ControlsScale from '@/components/ControlsScale.vue';
import ControlsCenter from '@/components/ControlsCenter.vue';

export default defineComponent({
  components: {
    ControlsScale,
    ControlsCenter,
  },
  props: {
    parentMethod: {
      type: Function,
      required: true,
    },
  },
  methods: {
    Recenter() {
      this.parentMethod();
    },
  },
});
</script>
>
