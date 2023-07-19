<template>
  <button
    ref="cargo"
    class="cargoBlockConnected"
    :style="style"
    @mousedown="handleClick"
  >
    <div>
      <p
        v-if="size.scaledLength > 50"
        class="text-proxima-bold cargoBlockConnected_text"
      >
        {{ cargo.uldNumber }}
      </p>
      <p
        v-if="size.scaledWidth > 60 && size.scaledLength > 50"
        class="text-proxima-bold cargoBlockConnected_text"
      >
        {{ cargo.weight }}kg
      </p>
    </div>
    <div v-if="size.scaledWidth > 85" class="cargoBlockConnected_bottom">
      <p v-if="group" class="text-proxima-bold cargoBlockConnected_group">
        {{ group }}
      </p>
      <p class="text-proxima-bold cargoBlockConnected_text___contour">
        {{ cargo.contour }}
      </p>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  moveOriginOfLateralCoordinates,
  createLocationFromDOMPosition,
  dispatchAllocateEvent,
  dispatchMoveCargoEvent,
} from '@/constants/functions';

import { CargoActionTypes, CargoMutationTypes } from '@/store/cargo.types';

export default defineComponent({
  props: {
    position: {
      type: String,
      required: true,
    },
  },

  computed: {
    cargo() {
      const connectedCargos = this.$store.state.cargo.connectedCargos!;

      const cargo = this.$store.state.cargo.cargo.find(
        (cargo) => cargo.uldNumber === connectedCargos.cargo
      );

      if (!cargo) {
        throw new TypeError(
          `CargoBlockConnected: expected cargo ${connectedCargos.cargo} to exist`
        );
      }

      return cargo;
    },
    positionObject() {
      const position = this.$store.state.aircraft.positions?.[this.position];

      if (!position) {
        throw new TypeError(
          `CargoBlockConnected: expected position ${this.position} to exist`
        );
      }

      return position;
    },
    size() {
      if (!this.cargo.base) {
        throw new TypeError('CargoBlockConnected: expected cargo.base to exist');
      }

      let length = this.cargo.base.length;
      let width = this.cargo.base.width;

      if (this.point.orientation === 'Width') {
        const temp = length;
        length = width;
        width = temp;
      }

      const scaledWidth = width * this.$store.state.dom.scale;
      const scaledLength = length * this.$store.state.dom.scale;

      return { width, length, scaledWidth, scaledLength };
    },
    point() {
      const point = this.$store.state.dom.grids.regular.find(
        (point) => point.context?.iataCode === this.position
      );

      if (!point) {
        throw new TypeError(
          `CargoBlockConnected: expected regular grid to have point with context.iataCode of ${this.position}`
        );
      }

      return point;
    },
    offset() {
      const { longitudinalBehavior, lateralBehavior } = this.point;

      const offset = [0, 0];
      switch (longitudinalBehavior) {
        case 'NEGATIVE':
          offset[0] = -1;
          break;
        case 'CENTER':
          offset[0] = -1 / 2;
          break;
        default:
          break;
      }
      switch (lateralBehavior) {
        case 'NEGATIVE':
          offset[1] = -1;
          break;
        case 'CENTER':
          offset[1] = -1 / 2;
          break;
        default:
          break;
      }

      return offset;
    },
    style() {
      const { scaledWidth, scaledLength } = this.size;
      const { normalizedLongitudinalCoordinate, normalizedLateralCoordinate } =
        this.point;

      const left = normalizedLongitudinalCoordinate + scaledLength * this.offset[0];
      const top = normalizedLateralCoordinate + scaledWidth * this.offset[1];

      return {
        width: `${scaledLength}px`,
        height: `${scaledWidth}px`,
        left: `${left}px`,
        top: `${top}px`,
        backgroundColor:
          this.$store.state.misc.destinationOptions[this.cargo.destination] ??
          'var(--color-primary-midnight-blue)',
      };
    },
  },
  methods: {
    handleClick() {
      const { width, length } = this.size;
      const { longitudinalCoordinate, lateralCoordinate } = this.point;

      const DOMPosition: CargoVisualization.BaseDOMPosition = {
        context: this.positionObject.DOMPosition.context,
        coordinates: [
          longitudinalCoordinate + length * this.offset[0],
          moveOriginOfLateralCoordinates(lateralCoordinate) + width * this.offset[1],
        ],
        width,
        length,
      };

      const fromAllocatedCargo = this.$store.state.cargo.allocatedCargos
        .flat()
        .some((allocatedCargo) => allocatedCargo.uldNumber === this.cargo.uldNumber);

      this.$store.dispatch(CargoActionTypes.DROP_CARGO, {
        cargo: this.cargo,
        position: DOMPosition,
      });

      if (fromAllocatedCargo) {
        dispatchMoveCargoEvent(this.$store.state.dom.shadowRoot, {
          uldNumber: this.cargo.uldNumber,
          allocationType: this.cargo.allocation.type,
          location: createLocationFromDOMPosition(DOMPosition),
          context: this.point?.context,
        });
      } else {
        dispatchAllocateEvent(this.$store.state.dom.shadowRoot, {
          uldNumber: this.cargo.uldNumber,
          allocationType: this.cargo.allocation.type,
          location: createLocationFromDOMPosition(DOMPosition),
          context: this.point?.context,
        });
      }

      this.$store.commit(CargoMutationTypes.SET_CONNECTED_CARGOS, null);
    },
  },
});
</script>
>
