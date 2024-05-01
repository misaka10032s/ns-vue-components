<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from '../tableStore.js'

    import _ from 'lodash'

    const $el = ref(null);

    const props = defineProps({
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.editing";

    const titleOrder = computed(() => store.getters.titleOrder.flat());
    const editingRow = computed(() => store.getters.editingRow);
    const editingRow_clone = ref({});

    const comfirm = () => {
        console.log(store.getters.editingRow, editingRow_clone.value)
        Object.assign(store.getters.editingRow, editingRow_clone.value);
        store.state.editingRow = null;
    }

    const reset = () => {
        editingRow_clone.value = _.cloneDeep(editingRow.value);
    }

    const cancel = () => {
        store.state.editingRow = null;
    }

    watch(() => store.getters.editingRow, (editingRow) => {
        editingRow_clone.value = _.cloneDeep(editingRow);
    }, { immediate: true });

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div class="info-block">
        <table>
            <tr v-for="title in titleOrder" :key="title.key">
                <td>
                    <div>{{ title.text }}</div>
                </td>
                <td>
                    <input v-if="title.editable && title.key in editingRow_clone" v-model="editingRow_clone[title.key]" />
                    <div v-else>{{ editingRow_clone?.[title.key] }}</div>
                </td>
            </tr>
        </table>
    </div>
    <div class="action-block">
        <button @click="comfirm()">修改</button>
        <button @click="reset()">重置</button>
        <button @click="cancel()">取消</button>
    </div>
</template>

<style scoped lang="scss">
.info-block{
    flex-grow: 1;

    table {
        margin: auto;
        width: min(80%, 800px);

        tr {
            td:first-child {
                width: 120px;
            }
        }
    }

    input {
        padding: .25rem .5rem;
        border: 1px solid #ccc;
        border-radius: .5rem;
        background-color: #00000020;
        width: 120px;
        transition: .3s;
        &:focus{
            width: 120px;
        }
        &:focus-visible{
            outline: none;
        }
    }
}
.action-block{
    min-height: 48px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    padding: 0 1rem;

    button{
        min-height: 32px;
        background-color: transparent;
        transition: background-color 0.3s;
        border: none;
        border-radius: 5px;
        padding: .5rem 1rem;

        &:hover{
            background-color: #22222240;
        }
    }
}
</style>