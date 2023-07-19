<template>
  <div :style="positionStyles" class="position">
    <div :class="className">
      <button v-if="showGroup" class="position_button" @click="handleClick">
        <img v-if="!isPartOfGroup" src="./assets/images/checkbox.svg" />
        <img v-if="isPartOfGroup" src="./assets/images/checkbox-checked.svg" />
      </button>
      <p class="text-proxima-bold position_iataCode">{{ position.iataCode }}</p>
      <p v-if="group" class="text-proxima-bold position_group">{{ group }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { GroupsMutationTypes } from '@/store/groups.types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    position: {
      type: Object as PropType<Aircraft.Position>,
      required: true,
    },
  },
  computed: {
    severity() {
      for (const validation of this.$store.state.misc.centerValidation) {
        if (validation.positions.includes(this.position.iataCode)) {
          return validation.severity;
        }
      }

      return null;
    },
    className() {
      if (!this.severity) {
        return 'position_code';
      }

      return {
        position_code___warning: this.severity === 'Warning',
        position_code___error: this.severity === 'Error',
      };
    },
    DOMPosition() {
      return this.$store.state.aircraft.positions?.[this.position.iataCode].DOMPosition;
    },
    showGroup() {
      return (
        this.$store.state.groups.activeGroup.length > 0 &&
        (!this.group || this.group === this.$store.state.groups.activeGroup)
      );
    },
    isPartOfGroup() {
      return this.$store.state.groups.includedPositions.includes(
        this.position.iataCode
      );
    },
    group() {
      if (
        (this.DOMPosition?.scaledWidth ?? 61) < 60 ||
        (this.DOMPosition?.scaledLength ?? 61) < 60
      ) {
        return null;
      }

      for (const [groupName, { positions }] of Object.entries(
        this.$store.state.groups.groups
      )) {
        if (positions.includes(this.position.iataCode)) {
          return groupName;
        }
      }

      return null;
    },
    positionStyles() {
      if (!this.DOMPosition) {
        return undefined;
      }

      return {
        left: `${this.DOMPosition.scaledCoordinates[0]}px`,
        top: `${this.DOMPosition.scaledCoordinates[1]}px`,
        width: `${this.DOMPosition.scaledLength}px`,
        height: `${this.DOMPosition.scaledWidth}px`,
      };
    },
  },
  methods: {
    handleClick() {
      if (this.isPartOfGroup) {
        this.$store.commit(GroupsMutationTypes.REMOVE_POSITION, this.position.iataCode);
        return;
      }
      this.$store.commit(GroupsMutationTypes.ADD_POSITION, this.position.iataCode);
    },
  },
});
</script>
