<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from './tableStore.js'

    import _ from 'lodash'

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

    const data = computed(() => config.value.data || []);
    const titleOrder = computed(() => config.value.titleOrder || []);
    const filters = computed(() => config.value.filters || []);
    const select = computed(() => config.value.select || []);
    const actions = computed(() => config.value.actions || []);
    const tableMode = computed(() => config.value.tableMode || 0);

    // init store
    // add index to data
    const initData = () => {
        store.state.data = data.value.map((row, index) => {
            const _row = _.cloneDeep(row);
            return {
                ..._row,
                _index: index,
                _selected: false,
            };
        });
    }

    const initTitleOrder = () => {
        store.state.titleOrder = titleOrder.value.map(title => {
            if (typeof title === "string") {
                return {
                    key: title,
                    text: title,
                };
            }
            else if (Array.isArray(title)) {
                return title.map(k => {
                    return {
                        key: k,
                        text: k,
                    };
                });
            }
            return title;
        });
    }
    
    const initFilters = () => {
        store.state.filters = filters.value.map(filter => {
            return {
                ...filter,
                status: 0,
            };
        });
    }

    const initSelect = () => {
        store.state.select = select.value.map(filter => {
            return {
                ...filter,
                status: 0,
            };
        });
    }

    const initActions = () => {
        Object.assign(store.state.actions, actions.value);
    }

    // init data
    const dataFileredCustom = computed(() => {
        return store.getters.data.filter(row => {
            return store.getters.filters.every(filter => {
                return filter.status === 0 || filter.func(row);
            });
        });
    });

    const dataFilered = computed(() => {
        return dataFileredCustom.value.filter(row => {
            return Object.values(row).some(cell => {
                return String(cell).toLowerCase().includes(store.getters.searchText.toLowerCase());
            });
        });
    });

    const sortedData = computed(() => {
        if(store.getters.sortKey === "") return dataFilered.value.slice();
        
        return dataFilered.value.slice().sort((a, b) => {
            const Avalue = Number.isNaN(Number(a[store.getters.sortKey])) ? a[store.getters.sortKey] : Number(a[store.getters.sortKey]);
            const Bvalue = Number.isNaN(Number(b[store.getters.sortKey])) ? b[store.getters.sortKey] : Number(b[store.getters.sortKey]);
            return Avalue > Bvalue ? 1 * store.getters.sortDir : -1 * store.getters.sortDir;
        });
    });

    const dataInbox = computed(() => {
        return sortedData.value.slice((store.getters.currentPage - 1) * store.getters.pageSize, store.getters.currentPage * store.getters.pageSize);
    });

    // methods
    const showFloating = computed(() => {
        return store.getters.viewingRow || store.getters.editingRow;
    });

    const switchPageAll = (checked) => {
        const currentPage = store.getters.currentPage;
        const pageSize = store.getters.pageSize;

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
        store.state.data.forEach(row => {
            row._selected = checked;
        });
    };

    const exportData = () => {
        emit("export", store.getters.data);
    };

    const nodata = () => {
        emit("nodata");
        console.log("nodata NStable", data.value);
    };


    // watch
    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });

    watch(() => data.value, (val) => {
        initData();
    }, { deep: true, immediate: true });

    watch(() => titleOrder.value, (val) => {
        initTitleOrder();
    }, { deep: true, immediate: true });

    watch(() => filters.value, (val) => {
        initFilters();
    }, { deep: true, immediate: true });

    watch(() => select.value, (val) => {
        initSelect();
    }, { deep: true, immediate: true });

    watch(() => actions.value, (val) => {
        initActions();
    }, { deep: true, immediate: true });

    watch(() => tableMode.value, (val) => {
        store.state.nowMode = val;
    });
</script>

<template>
    <div ref="$el" class="table-wrapper">
        <operations @export="exportData()"></operations>
        <seachBar @search="text => store.state.searchText=text"></seachBar>
        <mainTable :data="dataInbox" @switchPageAll="x => switchPageAll(x)" @switchAll="x => switchAll(x)" @nodata="nodata()"></mainTable>
        <pagination :dataLength="sortedData.length"></pagination>
        <transition name="popup">
            <modal v-if="showFloating"></modal>
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