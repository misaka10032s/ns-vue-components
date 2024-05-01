<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from '../tableStore.js'

    import row from './row.vue'
    import rowTitle from './rowTitle.vue'

    const $el = ref(null);

    const props = defineProps({
        data: {
            type: Array,
            default: () => []
        },
    });
    const { data } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.table";

    const emit = defineEmits(["switchPageAll", "switchAll", "nodata"]);

    const nowMode = computed(() => store.getters.nowMode);

    const nodata = () => {
        emit("nodata");
    };

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <table ref="$el" class="main-table">
        <thead>
            <rowTitle @switchPageAll="x => emit('switchPageAll', x)" @switchAll="x => emit('switchAll', x)"></rowTitle>
        </thead>
        <tbody>
            <TransitionGroup name="fade">
                <row v-for="(rowData, index) in data" :index="index" :rowData="rowData" :key="index"></row>
            </TransitionGroup>
            <tr v-if="!data.length">
                <td :colspan="store.getters.titleOrder.length + !!nowMode">
                    <div>
                        <span>noData</span>
                        <i class="fas fa-sync-alt mx-2" role="button" @click="nodata"></i>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped lang="scss">
    .main-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 0.5rem;
        th, td {
            padding: 0.5rem;
            text-align: center;
        }
    }

    tbody {
        tr {
            &:nth-child(odd) {
                background-color: #88888820;
            }
            &:hover {
                background-color: #88888840;
            }
        }
    }
</style>