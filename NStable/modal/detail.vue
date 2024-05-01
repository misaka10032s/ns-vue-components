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
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.detail";

    const viewingRow = computed(() => store.getters.viewingRow);
    const titleOrder = computed(() => store.getters.titleOrder.flat());

    const close = () => {
        store.state.viewingRow = null;
    }

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
                    <div>{{ viewingRow?.[title.key] }}</div>
                </td>
            </tr>
        </table>
    </div>
    <div class="action-block">
        <button @click="close()">關閉</button>
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