<template>
  <button class="text-proxima controlsScaleDropdown" @click="handleClick">
    <span>{{ group }}</span>
    <img src="./assets/images/check.svg" alt="Selected" :style="imageStyle" />
  </button>
</template>

<script lang="ts">
import { GroupsMutationTypes } from '@/store/groups.types';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    group: {
      type: String,
      required: true,
    },
  },
  emits: ['click'],
  computed: {
    imageStyle() {
      return {
        visibility:
          this.$store.state.groups.activeGroup === this.group ? undefined : 'hidden',
      };
    },
  },
  methods: {
    handleClick() {
      this.$store.commit(GroupsMutationTypes.SET_ACTIVE_GROUP, this.group);
      this.$emit('click');
    },
  },
});
</script>
>
