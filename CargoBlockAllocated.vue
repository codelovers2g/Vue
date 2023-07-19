<template>
  <div
    ref="cargo"
    :class="className"
    :style="style"
    @mousedown.stop.prevent="handleMouseDown($event)"
  >
    <div>
      <!-- <p v-if="size.length >= 50" class="text-proxima-bold cargoBlockAllocated_text"> -->

      <p
        v-if="size.width > 49 || size.length > 49"
        class="text-proxima-bold cargoBlockAllocated_text"
      >
        {{ cargo.uldNumber }}
      </p>
      <p
        v-if="size.width > 60 && size.length > 50"
        class="text-proxima-bold cargoBlockAllocated_text"
      >
        {{ cargo.weight }}kg
      </p>
    </div>
    <div
      v-if="size.width > 85 && !validation?.severity"
      class="cargoBlockAllocated_bottom"
    >
      <p v-if="group" class="text-proxima-bold cargoBlockAllocated_group">
        {{ group }}
      </p>
      <p class="text-proxima-bold cargoBlockAllocated_text___contour">
        {{ cargo.contour }}
      </p>
    </div>
    <button
      v-if="showGroup"
      class="cargoBlockAllocated_button"
      @mousedown.stop="handleGroupClick"
    >
      <img v-if="!isPartOfGroup" src="./assets/images/checkbox.svg" />
      <img v-if="isPartOfGroup" src="./assets/images/checkbox-checked.svg" />
    </button>
    <button
      v-if="size.length > 110 && !showGroup"
      class="cargoBlockAllocated_button"
      @mousedown.stop="toggleDropdown"
    >
      <img
        alt=""
        class="cargoBlockAllocated_img"
        src="./assets/images/uld-dropdown.svg"
      />
    </button>
    <div
      v-if="size.length > 110 && validation?.severity"
      :class="validationClass"
      @mouseenter="showWarning"
      @mouseleave="hideWarning"
    ></div>
  </div>
</template>

<script lang="ts">
import { GroupsMutationTypes } from '@/store/groups.types';
import { CargoActionTypes } from '@/store/cargo.types';

import { defineComponent, PropType } from 'vue';
import { MiscMutationTypes } from '@/store/misc.types';

export default defineComponent({
  props: {
    cargo: {
      type: Object as PropType<Cargo.DOMCargo>,
      required: true,
    },
  },
  data() {
    return {
      showDropdown: false,
      dropdownItems: ['Unload', 'Offload', 'Details'],
      isDragging: false,
      startX: null as any,
      startY: null as any,
    };
  },

  computed: {
    style() {
      const { DOMPosition, destination } = this.cargo;

      return {
        backgroundColor:
          this.$store.state.misc.destinationOptions[destination] ??
          'var(--color-primary-midnight-blue)',
        opacity:
          this.$store.state.cargo.movingCargo?.uldNumber === this.cargo.uldNumber
            ? '0.7'
            : '1',
        left: `${DOMPosition.scaledCoordinates[0]}px`,
        top: `${DOMPosition.scaledCoordinates[1]}px`,
        width: `${DOMPosition.scaledLength}px`,
        height: `${DOMPosition.scaledWidth}px`,
      };
    },
    dropdownStyle() {
      const { DOMPosition } = this.cargo;
      return {
        top: `${DOMPosition.scaledWidth / 2}px`,
      };
    },
    scale() {
      return this.$store.state.dom.scale;
    },
    size() {
      const { DOMPosition } = this.cargo;
      return {
        length: DOMPosition.scaledLength,
        width: DOMPosition.scaledWidth,
      };
    },
    group() {
      for (const [groupName, { ulds }] of Object.entries(
        this.$store.state.groups.groups
      )) {
        if (ulds.includes(this.cargo.uldNumber)) {
          return groupName;
        }
      }

      return null;
    },
    showGroup() {
      return (
        this.$store.state.groups.activeGroup.length > 0 &&
        (!this.group || this.group === this.$store.state.groups.activeGroup)
      );
    },
    isPartOfGroup() {
      return this.$store.state.groups.includedULDs.includes(this.cargo.uldNumber);
    },
    validation() {
      for (const validation of this.$store.state.misc.uldValidation) {
        if (validation.ulds.includes(this.cargo.uldNumber)) {
          return validation;
        }
      }

      return null;
    },
    className() {
      if (!this.validation) {
        return 'cargoBlockAllocated';
      }

      return {
        cargoBlockAllocated___warning: this.validation.severity === 'Warning',
        cargoBlockAllocated___error: this.validation.severity === 'Error',
      };
    },
    validationClass() {
      if (!this.validation) {
        return;
      }

      return {
        cargoBlockAllocated_validation___warning:
          this.validation.severity === 'Warning',
        cargoBlockAllocated_validation___error: this.validation.severity === 'Error',
      };
    },
  },
  methods: {
    toggleDropdown() {
      this.$store.commit(MiscMutationTypes.SET_ULD_DROPDOWN, {
        uldNumber: this.cargo.uldNumber,
        DOMRect: (this.$refs.cargo as HTMLElement).getBoundingClientRect(),
      });
    },

    // handleMouseDown(event:any) {
    //   this.showDropdown = false;
    //   this.$store.dispatch(CargoActionTypes.MOVE_CARGO, this.cargo);
    // },

    handleMouseDown(event: any) {
      event.preventDefault();
      this.showDropdown = false;
      this.isDragging = false;
      this.startX = event.clientX;
      this.startY = event.clientY;
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseMove(event: any) {
      if (
        !this.isDragging &&
        (Math.abs(this.startX) > 20 || Math.abs(this.startY) > 20)
      ) {
        this.isDragging = true;
      }
      if (this.isDragging) {
        this.$store.dispatch(CargoActionTypes.MOVE_CARGO, this.cargo);
      }
    },
    handleMouseUp(event: any) {
      this.isDragging = false;
      this.startX = null;
      this.startY = null;
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
    },

    handleGroupClick() {
      if (this.isPartOfGroup) {
        this.$store.commit(GroupsMutationTypes.REMOVE_ULD, this.cargo.uldNumber);
        return;
      }

      this.$store.commit(GroupsMutationTypes.ADD_ULD, this.cargo.uldNumber);
    },
    showWarning() {
      if (!this.validation) {
        return;
      }

      this.$store.commit(MiscMutationTypes.SET_VALIDATION_MESSAGE_POPOVER, {
        validation: this.validation,
        DOMRect: (this.$refs.cargo as HTMLElement).getBoundingClientRect(),
      });
    },
    hideWarning() {
      this.$store.commit(MiscMutationTypes.SET_VALIDATION_MESSAGE_POPOVER, null);
    },
  },
});
</script>
