<template>
  <div class="controlsCenter">
    <template v-if="!modifyGroup">
      <ControlsGroup @click="toggleGroup" />
      <ControlsUnload />
    </template>
    <ControlsSelectGroup v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ControlsGroup from '@/components/ControlsGroup.vue';
import ControlsUnload from '@/components/ControlsUnload.vue';
import ControlsSelectGroup from '@/components/ControlsSelectGroup.vue';

import { GroupsMutationTypes } from '@/store/groups.types';

export default defineComponent({
  components: {
    ControlsGroup,
    ControlsUnload,
    ControlsSelectGroup,
  },
  computed: {
    modifyGroup() {
      return this.$store.state.groups.modifyGroup;
    },
  },
  methods: {
    toggleGroup() {
      this.$store.commit(GroupsMutationTypes.TOGGLE_MODIFY_GROUP);
    },
  },
});
</script>
