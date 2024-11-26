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
        index: {
            type: Number,
            required: true,
        },
        column: {
            type: Object,
            required: true,
        },

        rowData: {
            type: [String, Number, Object, Array, Boolean, Symbol, Function, Date, BigInt, Map, Set, WeakMap, WeakSet, null, undefined],
            default: "",
        },
    });
    const { tableID, index, column, rowData } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.cell";

    const emit = defineEmits(["edit"]);

    const actions = computed(() => store.getters.actions(tableID.value));

    const doOperation = (operation, $event, rowData, col) => {
        store.dispatch("rowInteraction", {tableID: tableID.value, operation, $event, rowData, col});
    };

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <td ref="$el" class="data-col">
        <div v-if="Array.isArray(column)">
            <div v-for="col in column" @click="doOperation(actions?.click, $event, rowData, col)" @contextmenu="doOperation(actions?.contextmenu, $event, rowData, col)">
                {{ rowData[col.key] }}
            </div>
        </div>
        <div v-else @click="doOperation(actions?.click, $event, rowData, column)" @contextmenu="doOperation(actions?.contextmenu, $event, rowData, column)">
            {{ rowData[column.key] }}
        </div>
    </td>
</template>

<style scoped lang="scss">
.data-col {
    padding: .25rem .5rem;
    height: 1px;

    > div {
        height: 100%;
    }
}
</style>