<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from './tableStore.js'

    const $el = ref(null);

    const props = defineProps({
        tableID: {
            type: String,
            required: true,
        },
        dataLength: {
            type: Number,
            default: 0
        },
        // how many page button show
        pageButtonLength: {
            type: Number,
            default: 5
        },
        // is show first and last page button
        isShowFirstLast: {
            type: Boolean,
            default: true
        },
        // is show prev and next page button
        isShowPrevNext: {
            type: Boolean,
            default: true
        },
    });
    const { tableID, dataLength, pageButtonLength, isShowFirstLast, isShowPrevNext } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.pagination";

    const currentPage = computed(() => store.state.currentPage[tableID.value]);
    const pageSize = computed(() => store.state.pageSize[tableID.value]);
    const maxPage = computed(() => Math.ceil(dataLength.value / pageSize.value));
    const pageButtonBox = computed(() => {
        const box = [];
        const from = Math.max(1, currentPage.value - Math.floor(pageButtonLength.value / 2));
        const to = Math.min(maxPage.value, from + pageButtonLength.value - 1);
        for(let i =from; i <= to; i++) {
            box.push(i);
        }
        return box;
    });

    const pageChange = (page) => {
        if (page < 1) page = 1;
        else if (page > maxPage.value) page = maxPage.value;
        
        if (currentPage.value !== page) {
            store.state.currentPage[tableID.value] = page;
        }
    }

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el" class="pagination-block">
        <div class="page-btns">
            <button class="page-btn first" @click="pageChange(1)" v-if="isShowFirstLast" :disabled="dataLength <= pageSize || dataLength === 0 || dataLength === pageSize * (currentPage - 1)">First</button>
            <button class="page-btn prev" @click="pageChange(currentPage - 1)" v-if="isShowPrevNext" :disabled="currentPage === 1">Prev</button>
            <button class="page-btn" v-for="i in pageButtonBox" :key="i" @click="pageChange(i)" :class="{'active': currentPage === i, [`page-${i}`]:1}">{{ i }}</button>
            <button class="page-btn next" @click="pageChange(currentPage + 1)" v-if="isShowPrevNext" :disabled="currentPage === maxPage">Next</button>
            <button class="page-btn last" @click="pageChange(maxPage)" v-if="isShowFirstLast" :disabled="dataLength <= pageSize || dataLength === 0 || dataLength === pageSize * (currentPage - 1)">Last</button>
        </div>
        <div class="data-count">
            <span>共 {{ dataLength }} 筆資料</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .pagination-block{
        margin: .5rem 0;
    }
    .page-btns {
        display: flex;
        gap: 5px;
    }
    .page-btns button.active {
        color: #fff;
        background-color: #22222270;
    }
    .data-count {
        display: flex;
        justify-content: flex-end;
    }
    .data-count span {
        padding: 5px;
    }
    .page-btn {
        padding: .25rem .5rem;
        border: 1px solid #ccc;
        background-color: transparent;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;

        &:hover {
            color: #fff;
            background-color: #22222270;
        }

        &:disabled {
            background-color: #cccccca0;
            color: #413838;
            cursor: not-allowed;
        }
    }
</style>