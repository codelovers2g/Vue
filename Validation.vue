<template>
    <div class="validation">
        <ValidationBox v-for="error in errors" :key="error.message" :validation="error" />
        <ValidationBox v-for="warning in warnings"
                       :key="warning.message"
                       :validation="warning" />
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    import ValidationBox from '@/components/ValidationBox.vue';

    export default defineComponent({
        components: {
            ValidationBox,
        },

        computed: {
            warnings() {
                return this.$store.state.misc.centerValidation.filter(
                    (validation) => validation.severity === 'Warning'
                );
            },
            errors() {
                return this.$store.state.misc.centerValidation.filter(
                    (validation) => validation.severity === 'Error'
                );
            },
        },
    });
</script>
