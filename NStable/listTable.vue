<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from './tableStore.js'

    import mainTable from './listTable/mainTable.vue'
    import operations from './operations.vue'
    import seachBar from './searchBar.vue'
    import pagination from './pagination.vue'
    import modal from './modal.vue'

    const $el = ref(null);

    const props = defineProps({
        config: {
            type: Object,
            required: true,
            default: () => {},
        },
    });
    const { config } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSlistTable.wrapper";

    const emit = defineEmits(["nodata", "export"]);

    const tableID = config.value.tableID || Math.random().toString(36).substring(2);
    const tableHash = Math.random().toString(36).substring(2);
    const data = computed(() => config.value.data || []);
    const titleOrder = computed(() => config.value.titleOrder || []);
    const filters = computed(() => config.value.filters || []);
    const select = computed(() => config.value.select || []);
    const actions = computed(() => config.value.actions || []);
    const tableMode = computed(() => config.value.tableMode || 0);
    const enableMode = computed(() => config.value.enableMode || [0, 1, 2, 3]);

    // init data
    store.commit("initTable", {tableID, tableHash});
    
    const dataFileredCustom = computed(() => {
        return store.getters.data(tableID).filter(row => {
            return store.getters.filters(tableID).every(filter => {
                return !filter.status || filter.func(row);
            });
        });
    });

    const dataFilered = computed(() => {
        return dataFileredCustom.value.filter(row => {
            return Object.values(row).some(cell => {
                return String(cell).toLowerCase().includes(store.getters.searchText(tableID).toLowerCase());
            });
        });
    });

    const sortedData = computed(() => {
        if(store.getters.sortKey(tableID) === "") return dataFilered.value.slice();

        const [sortKey, sortDir] = [store.getters.sortKey(tableID), store.getters.sortDir(tableID)];
        
        return dataFilered.value.slice().sort((a, b) => {
            const Avalue = Number.isNaN(Number(a[sortKey])) ? a[sortKey] : Number(a[sortKey]);
            const Bvalue = Number.isNaN(Number(b[sortKey])) ? b[sortKey] : Number(b[sortKey]);
            return Avalue > Bvalue ? sortDir : -sortDir;
        });
    });

    const dataInbox = computed(() => {
        const [currentPage, pageSize] = [store.getters.currentPage(tableID), store.getters.pageSize(tableID)];
        return sortedData.value.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    });

    // methods
    const switchPageAll = (checked) => {
        const [currentPage, pageSize] = [store.getters.currentPage(tableID), store.getters.pageSize(tableID)];

        for(let i = (currentPage - 1) * pageSize; i < currentPage * pageSize; i++){
            if(i >= sortedData.value.length) break;
            sortedData.value[i]._selected = checked;
        }
    };

    const switchAll = (checked) => {
        sortedData.value.forEach(row => {
            row._selected = checked;
        });
    };

    const switchRealAll = (checked) => {
        store.commit("switchRealAll", {tableID, checked});
    };

    const exportData = () => {
        emit("export", store.getters.data(tableID));
    };

    const nodata = () => {
        emit("nodata");
        console.log("nodata NStable", data.value);
    };


    // watch
    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });

    watch(() => data.value, (data) => {
        store.commit("updateData", {tableID, tableHash, data});
    }, { deep: true, immediate: true });

    watch(() => titleOrder.value, (titleOrder) => {
        store.commit("updateTitleOrder", {tableID, tableHash, titleOrder});
    }, { deep: true, immediate: true });

    watch(() => filters.value, (filters) => {
        store.commit("updateFilters", {tableID, tableHash, filters});
    }, { deep: true, immediate: true });

    watch(() => select.value, (select) => {
        store.commit("updateSelect", {tableID, tableHash, select});
    }, { deep: true, immediate: true });

    watch(() => actions.value, (actions) => {
        store.commit("updateActions", {tableID, tableHash, actions});
    }, { deep: true, immediate: true });

    watch(() => tableMode.value, (nowMode) => {
        store.commit("updateNowMode", {tableID, tableHash, nowMode});
    });

    watch(() => enableMode.value, (enableMode) => {
        store.commit("updateEnableMode", {tableID, tableHash, enableMode});
    });
</script>

<template>
    <div ref="$el" class="table-wrapper">
        <operations :tableID="tableID" @export="exportData()"></operations>
        <seachBar @search="text => store.commit('searchText', {tableID, text})"></seachBar>
        <mainTable :tableID="tableID" :data="dataInbox" @switchPageAll="x => switchPageAll(x)" @switchAll="x => switchAll(x)" @nodata="nodata()"></mainTable>
        <pagination :tableID="tableID" :dataLength="sortedData.length"></pagination>
        <transition name="popup">
            <modal :tableID="tableID" v-if="store.getters.showFloating(tableID)"></modal>
        </transition>
    </div>
</template>

<style scoped lang="scss">
.popup-leave-active {
    animation: popup-out 0.5s;
}
.popup-enter-active {
    animation: popup-in 0.5s;
}

@keyframes popup-in {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
@keyframes popup-out {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}
.table-wrapper{
    margin: .5rem 0;
}
</style>

<!-- wrapper -->