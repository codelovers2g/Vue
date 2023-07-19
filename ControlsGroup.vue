<template>
  <button class="text-proxima-semibold controlsGroup" @click="$emit('click')">
    <img src="./assets/images/plus-square.svg" class="controlsGroup_img" />
    <span>Create Group</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['click'],
});
</script>
>
