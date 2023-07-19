<template>
  <div v-if="show" :class="className">
    <h2 class="text-proxima-bold validationBox_h2">{{ validation.severity }}</h2>
    <p class="text-proxima validationBox_message">{{ validation.message }}</p>
    <button @click="handleClick" class="validationBox_button">
      <img alt="close" src="./assets/images/cancel.svg" />
    </button>
  </div>
</template>

<script lang="ts">
    import { defineComponent, PropType } from 'vue';

export default defineComponent({
  data() {
    return {
      show: true,
    };
  },
  props: {
    validation: {
      type: Object as PropType<CargoVisualization.Validation>,
      required: true,
    },
  },
  computed: {
    className() {
      return {
        validationBox___warning: this.validation.severity === 'Warning',
        validationBox___error: this.validation.severity === 'Error',
      };
    },
  },
  methods: {
    handleClick() {
      this.show = false;
    },
    callFunction() {
      setTimeout(() => {  
        this.show = false;
      }, 5000);
    },
  },
  mounted() {
    this.callFunction();
  },
});
</script>

