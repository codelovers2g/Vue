<template>
  <div class="controlsScale" ref="controlsScale">
    <div v-if="isDropdownOpen" class="controlsScale_dropdown">
      <ControlsScaleDropdown :scale="0.5" :set-scale="() => setScale(0.5)" />
      <ControlsScaleDropdown :scale="0.75" :set-scale="() => setScale(0.75)" />
      <ControlsScaleDropdown :scale="1" :set-scale="() => setScale(1)" />
      <ControlsScaleDropdown :scale="1.5" :set-scale="() => setScale(1.5)" />
      <ControlsScaleDropdown :scale="2" :set-scale="() => setScale(2)" />
      <ControlsScaleDropdown :scale="3" :set-scale="() => setScale(3)" />
    </div>
    <div class="controlsScale_buttons">
      <button class="controlsScale_button" @click="scaleDown">
        <img src="./assets/images/minus.svg" alt="Zoom Out" />
      </button>
      <button
        class="text-proxima-semibold controlsScale_dropdownToggle"
        @click="toggleDropdown"
      >
        <span>{{ readableScale }}%</span>
        <img src="./assets/images/chevron-up.svg" alt="View More" />
      </button>
      <button class="controlsScale_button" @click="scaleUp">
        <img src="./assets/images/plus.svg" alt="Zoom In" />
      </button>
      <button
      class="text-proxima-semibold controlsScale_recenter"
      style="
        font-size: 14px;
        z-index: 1;
        border: none;
        background-color: white;
        padding: 7px 20px;
      "
      @click="Recenter($event)"
    >
      Recenter
    </button>
     
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';

import ControlsScaleDropdown from '@/components/ControlsScaleDropdown.vue';

import { DOMActionTypes } from '@/store/dom.types';

import { getBoundedScale } from '@/constants/functions';

export default defineComponent({
  components: {
    ControlsScaleDropdown,
  },
  props: {
    parentChildMethod: {
      type: Function,
      required: true
    }
  },
  setup() {
    return {
      mouseUpCount: inject('mouseUpCount') as number,
    };
  },
  data() {
    return {
      isDropdownOpen: false,
      opened: false,
    };
  },
  computed: {
    scale() {
      return this.$store.state.dom.scale;
    },
    readableScale() {
      return Math.round((this.$store.state.dom.scale + Number.EPSILON) * 100);
    },
  },
  watch: {
    mouseUpCount() {
      if (!this.opened) {
        this.opened = true;
        return;
      }

      this.opened = false;
      this.isDropdownOpen = false;
    },
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    scaleUp() {
      this.$store.dispatch(
        DOMActionTypes.SET_SCALE,
        getBoundedScale(this.scale + 0.15)
      );
    },
    scaleDown() {
      this.$store.dispatch(
        DOMActionTypes.SET_SCALE,
        getBoundedScale(this.scale - 0.15)
      );
    },
    setScale(scale: number) {
      this.isDropdownOpen = false;
      this.$store.dispatch(DOMActionTypes.SET_SCALE, scale);
    },
    Recenter(event: any) {
      event.preventDefault();
      this.$store.dispatch(DOMActionTypes.SET_SCALE, 0.6);
      var aircraftContainer: any = this.$parent?.$parent?.$refs.aircraft_container;
      aircraftContainer.style.transform = 'scale(1)';
      aircraftContainer.style.transformOrigin = '0 0';
      this.parentChildMethod();
    },
  }
});
</script>
>
