<template>
  <div
    class="aircraft"
    ref="aircraft"
    @mousedown.ctrl="onMouseDown($event)"
    @mouseup="onMouseUp()"
    @wheel.ctrl="onWheel($event)"
  >
    <Validation />
    <Controls :parentMethod="Recenter" />
    <div
      class="aircraft_container"
      ref="aircraft_container"
      :style="{ transform: 'scale(' + scale + ')', transformOrigin: zoomPosition }"
    >
      <AircraftVisualizationFloor
        v-for="(floor, index) in floors"
        :key="index"
        :floor="floor"
        :index="index"
        :data-index="index"
        :style="positionStyles"
        ref="cargo"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';

import AircraftVisualizationFloor from '@/components/AircraftVisualizationFloor.vue';
import Controls from '@/components/Controls.vue';
import Validation from '@/components/Validation.vue';

import { DOMActionTypes } from '@/store/dom.types';

import { getBoundedScale } from '@/constants/functions';
import { MiscMutationTypes } from '@/store/misc.types';
import { CargoActionTypes, CargoMutationTypes } from '@/store/cargo.types';
export default defineComponent({
  components: {
    AircraftVisualizationFloor,
    Controls,
    Validation,
  },
  setup() {
    return {
      mousePosition: inject('mousePosition') as [number, number],
    };
  },
  data() {
    return {
      moving: false,
      start: [0, 0] as CargoVisualization.Coordinates,
      position: [0, 0] as CargoVisualization.Coordinates,
      offset: [0, 0] as CargoVisualization.Coordinates,
      zoomLevel: 1,
      scale: 1,
      zoomPosition: '0 0',
    };
  },
  computed: {
    floors(): Aircraft.Hold[][] {
      return this.$store.state.aircraft.floors ?? [];
    },

    positionStyles(): { transform: string; cursor: string | undefined } {
      return {
        transform: `translate(${this.position[0]}px, ${this.position[1]}px)`,
        cursor: this.moving ? 'move' : undefined,
      };
    },
  },
  watch: {
    mousePosition: {
      handler(newMousePosition): void {
        if (!this.moving) {
          return;
        }

        this.position = [
          newMousePosition[0] - this.start[0] + this.offset[0],
          newMousePosition[1] - this.start[1] + this.offset[1],
        ];
      },
    },
  },
  methods: {
    onMouseDown(event: any): void {
      // event.stopPropagation();
      this.moving = true;
      this.start = [this.mousePosition[0], this.mousePosition[1]];
      this.offset = [...this.position];
    },

    onMouseUp(): void {
      this.moving = false;
      this.$store.dispatch(DOMActionTypes.DEBOUNCED_TRANSFORM_DEPENDENTS);
    },
    onWheel(event: any): void {
      event.preventDefault();
      //Zoom in/out on mouse scale
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newScale = this.scale + delta;
      if (newScale > 0.1 && newScale < 3) {
        const rect = (event.currentTarget as any).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const zoomX = x / rect.width;
        const zoomY = y / rect.height;
        this.zoomPosition = `${zoomX * 100}% ${zoomY * 100}%`;
        this.scale = newScale;
      }

      // this.$store.dispatch(
      //   DOMActionTypes.SET_SCALE,
      //   getBoundedScale(this.$store.state.dom.scale + event.deltY * 0.001)
      // );
    },
    // To fix previos scale when zoom in/out after recenter button click
    Recenter() {
      this.scale = 1;
    },
  },
  mounted() {
    // to disappear old warnings
    this.$store.commit(MiscMutationTypes.CLEAR_VALIDATION_DATA);
    //To make empty cargo list in new flytes
    this.$store.commit(CargoMutationTypes.RESET_CARGO);
  },
});
</script>