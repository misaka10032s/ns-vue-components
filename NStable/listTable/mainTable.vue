<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from '../tableStore.js'

    import cell from './cell.vue'

    const $el = ref(null);

    const props = defineProps({
        tableID: {
            type: String,
            required: true,
        },
        data: {
            type: Array,
            default: () => []
        },
    });
    const { tableID, data } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.listTable.mainTable";

    const emit = defineEmits(["switchPageAll", "switchAll", "nodata"]);

    const nowMode = computed(() => store.getters.nowMode(tableID.value));

    const nodata = () => {
        emit("nodata");
    };

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el" class="main-table">
        <transition-group name="list">
            <cell v-for="(celldata, index) in data" :tableID="tableID" :celldata="celldata" :key="index"></cell>
        </transition-group>
        <div v-if="!data.length">
            <span>noData</span>
            <i class="fas fa-sync-alt mx-2" role="button" @click="nodata"></i>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .main-table {
        display: flex;
        gap: 1rem;
        width: 100%;
        border-spacing: 0;
        border-radius: 0.5rem;
        flex-wrap: wrap;
    }
    .list-move, /* apply transition to moving elements */
    .list-enter-active,
    .list-leave-active {
        transition: all 0.5s ease;
    }

    .list-enter-from,
    .list-leave-to {
        opacity: 0;
        transform: translateY(30px);
    }
</style>