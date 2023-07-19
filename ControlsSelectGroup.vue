<template>
  <div class="controlsSelectGroup">
    <div class="controlsSelectGroup_inputHolder">
      <input
        ref="input"
        class="text-proxima controlsSelectGroup_input"
        placeholder="Select or create a new group name"
        type="text"
        :value="activeGroup"
        @input="handleInput"
      />
      <button class="controlsSelectGroup_view" @click="toggleDropdown">
        <img alt="View groups" src="./assets/images/chevron-up.svg" />
      </button>
    </div>
    <button class="controlsSelectGroup_cancel" @click="handleCancel">
      <img alt="Cancel" src="./assets/images/cancel.svg" />
    </button>
    <button class="text-proxima-semibold controlsSelectGroup_save" @click="handleSave">
      <img alt="" class="controlsSelectGroup_check" src="./assets/images/check.svg" />
      <span>Save</span>
    </button>
  </div>
  <div v-if="isDropdownOpen" class="controlsSelectGroup_dropdown">
    <ControlsSelectGroupDropdown
      v-for="group in groups"
      :key="group"
      :group="group"
      @click="toggleDropdown"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  dispatchCreateGroupEvent,
  dispatchUpdateGroupEvent,
} from '@/constants/functions';

import ControlsSelectGroupDropdown from '@/components/ControlsSelectGroupDropdown.vue';

import { GroupsMutationTypes } from '@/store/groups.types';

export default defineComponent({
  components: {
    ControlsSelectGroupDropdown,
  },
  data() {
    return {
      isDropdownOpen: false,
    };
  },
  computed: {
    groups() {
      return Object.keys(this.$store.state.groups.groups);
    },
    activeGroup() {
      return this.$store.state.groups.activeGroup;
    },
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    handleInput(event: Event) {
      this.$store.commit(
        GroupsMutationTypes.SET_ACTIVE_GROUP,
        (event.target as HTMLInputElement).value
      );
    },
    handleCancel() {
      this.$store.commit(GroupsMutationTypes.FLUSH_GROUP);
    },
    handleSave() {
      const isUpdatingGroup = Object.prototype.hasOwnProperty.call(
        this.$store.state.groups.groups,
        this.$store.state.groups.activeGroup
      );

      const activeGroup = this.$store.state.groups.activeGroup;

      this.$store.commit(GroupsMutationTypes.COMMIT_GROUP);

      if (isUpdatingGroup) {
        dispatchUpdateGroupEvent(this.$store.state.dom.shadowRoot, {
          name: activeGroup,
          ...this.$store.state.groups.groups[activeGroup],
        });
        return;
      }

      dispatchCreateGroupEvent(this.$store.state.dom.shadowRoot, {
        name: activeGroup,
        ...this.$store.state.groups.groups[activeGroup],
      });
    },
    mounted() {
      (this.$refs.input as HTMLElement).focus();
    },
  },
});
</script>
>
