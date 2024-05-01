<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from '../tableStore.js'

    import cell from './cell.vue';

    const $el = ref(null);

    const props = defineProps({
        index: {
            type: Number,
            required: true,
        },

        rowData: {
            type: Object,
            default: () => {},
        },

        showSerial: {
            type: Boolean,
            default: false,
        },
    });
    const { index, rowData, showSerial } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.row";

    const nowMode = computed(() => store.getters.nowMode);

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <tr ref="$el" :class="{'data-row-view': nowMode===0}">
        <td v-if="nowMode===1" width="100">
            <button class="action-btn edit" @click="store.state.editingRow=rowData">編輯</button>
        </td>

        <td v-if="nowMode===2" width="50">
            <input class="action-checkbox" type="checkbox" v-model="rowData._selected"/>
        </td>

        <td v-if="showSerial">{{ index + 1 }}</td>

        <cell v-for="column in store.getters.titleOrder" :index="index" :column="column" :rowData="rowData"/>
    </tr>
</template>

<style scoped lang="scss">
    .data-row-view {
        cursor: pointer;
    }
    .action-btn {
        padding: .25rem .5rem;
        border: 1px solid #ccc;
        background-color: transparent;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;
    }
    .action-checkbox {
        cursor: pointer;
    }
    .edit {
        color: #000;
    }
    .edit:hover {
        background-color: #00000020;
        color: #fff;
    }
    .action-btn, .action-checkbox {
        display: block;
        margin: 0 auto;
    }
    td{
        border-bottom: 1px solid #ccc;
    }
</style>