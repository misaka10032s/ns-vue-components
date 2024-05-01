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
        searchDelay: {
            type: Number,
            default: 500
        },
    });
    const { searchDelay } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.searchBar";

    const emit = defineEmits(["search"]);

    const searchText = ref("");
    const searchTimeout = ref(null);

    const searchData = (delay=searchDelay.value) => {
        clearTimeout(searchTimeout.value);
        searchTimeout.value = setTimeout(() => {
            emit("search", searchText.value);
        }, Math.max(0, delay));
    }

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el" class="search-box">
        <i class="fas fa-search"></i>
        <div class="separator"></div>
        <input class="search-text" type="text" v-model="searchText" @input="searchData" placeholder="請輸入搜尋文字...">
    </div>
</template>

<style scoped lang="scss">
    .search-box {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: .25rem;
        margin: 0.5rem 0;
        border: 1px solid #aaa;
        border-radius: 0.5rem;

        i {
            margin: 0 0.5rem;
        }
        .separator {
            width: 1px;
            height: 1.5rem;
            background-color: #aaa;
            margin: 0 0.5rem;
        }
        .search-text {
            width: 100%;
            border: none;
            background-color: transparent;

            &:focus {
                outline: none;
            }

            &::placeholder {
                color: #777;
            }
        }
    }
</style>