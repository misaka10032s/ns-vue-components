<script setup>
    import { useI18n } from 'vue-i18n'
    
    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from '../tableStore.js'

    const $el = ref(null);

    const props = defineProps({
        tableID: {
            type: String,
            required: true,
        },
        column: {
            type: Object,
            required: true,
        },
    });
    const { tableID, column } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.cell";

    const emit = defineEmits([]);

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <th ref="$el" class="title-col">
        <template v-if="Array.isArray(column)">
            <div v-for="col in column"  @click="store.commit('sort', {tableID, key: col.key})">
                <span>
                    {{ col.text }}
                    <template v-if="store.getters.sortKey(tableID) === col.key">
                        <i v-if="store.getters.sortDir(tableID) > 0" class="fas fa-sort-up"></i>
                        <i v-else class="fas fa-sort-down"></i>
                    </template>
                </span>
            </div>
        </template>
        <div @click="store.commit('sort', {tableID, key: column.key})">
            <span>
                {{ column.text }}
                <template v-if="store.getters.sortKey(tableID) === column.key">
                    <i v-if="store.getters.sortDir(tableID) > 0" class="fas fa-sort-up"></i>
                    <i v-else class="fas fa-sort-down"></i>
                </template>
            </span>
        </div>
    </th>
</template>

<style scoped lang="scss">
.title-col {
    padding: .25rem .5rem;
}
</style>