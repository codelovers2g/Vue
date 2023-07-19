<template>
  <div v-if="cargos.length > 0" ref="cargos" class="cargos">
    <div class="cargos_container">
      <div v-if="isScrolling" class="cargos_blocker" />
      <button v-if="isScrolling" class="cargos_button" @click="handleRightClick">
        <img
          alt="View More"
          class="cargos_scroll"
          src="./assets/images/arrow-right.svg"
        />
      </button>
    </div>

    <CargoBlockToAllocate
      v-for="cargo in cargos"
      :key="cargo.uldNumber"
      :cargo="cargo"     
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import CargoBlockToAllocate from '@/components/CargoBlockToAllocate.vue';

export default defineComponent({
  components: {
    CargoBlockToAllocate,
  },
  data() {
    return {
      isScrolling: false,
    };
  },
  computed: {
    cargos() {
      return this.$store.state.cargo.cargosToAllocate;
    },
  },
  updated() {
    const cargos = this.$refs.cargos as HTMLElement | undefined;

    if (!cargos) {
      this.isScrolling = false;
      return;
    }

    this.isScrolling = cargos.scrollWidth > window.innerWidth;
  },
  methods: {
    handleRightClick() {
      const cargos = this.$refs.cargos as HTMLElement | undefined;

      if (!cargos) {
        return;
      }

      cargos.scroll({
        behavior: 'smooth',
        left: cargos.scrollLeft + 100,
      });
    },
  },
  mounted(){
    var box = this.$refs.cargos as HTMLElement
  }
});
</script>
