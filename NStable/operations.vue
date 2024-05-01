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
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.actions";

    const emit = defineEmits(["export"]);

    const groupOrder = ref([]);
    const filterGroups = computed(() => {
        const res = {};
        store.state.filters.forEach(filter => {
            // if 'group' in filter, place it in the group
            const groupName = 'group' in filter ? filter.group : 'default';
            
            if (!(groupName in res)) {
                res[groupName] = [];
                groupOrder.value.push(groupName);
            }
            res[groupName].push(filter);
        });
        console.log(groupOrder.value, res)
        return res;
    });

    const selectedRows = computed(() => store.state.data.filter(row => row._selected));

    const doOperation = (operation) => {
        store.dispatch("selectedOperation", {operation, selectedRows: selectedRows.value});
    };

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
        filterGroups.value;
    });
</script>

<template>
    <div ref="$el">
        <div class="basic-operation">
            <div class="default-group">
                <select class="table-mode-select" v-model="store.state.nowMode">
                    <option :value="0">檢視</option>
                    <option :value="1">編輯</option>
                    <option :value="2">選擇</option>
                </select>

                <button class="export-btn" @click="emit('export')">
                    <i class="fas fa-file-export"></i>
                    <!-- send the store data to out side -->
                    <span>匯出</span>
                </button>
            </div>

            <div v-for="groupName in groupOrder" class="filter-group-custom" :class="`filter-group-${groupName}`">
                <button v-for="(ctx) in filterGroups[groupName]" @click="ctx.status^=1" :title="ctx.name" :class="{'active': ctx.status}">
                    <i :class="ctx.icon" alt="icon" v-if="ctx.icon"></i>
                    <img :src="ctx.image" alt="icon" v-else-if="ctx.image">
                    <span v-else-if="!ctx.text">{{ ctx.name }}</span>
                    <span v-if="ctx.text">{{ ctx.text }}</span>
                </button>
            </div>
        </div>

        <div class="selected-rows-operation">
            <template v-if="selectedRows.length">
                <span>已選 {{ selectedRows.length }} 筆資料</span>
                <button v-for="ctx in store.getters.select" @click="doOperation(ctx)">
                    <i :class="ctx.icon" alt="icon" v-if="ctx.icon"></i>
                    <img :src="ctx.image" alt="icon" v-else-if="ctx.image">
                    <span v-else-if="!ctx.text">{{ ctx.name }}</span>
                    <span v-if="ctx.text">{{ ctx.text }}</span>
                </button>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .basic-operation{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
    }
    .filter-group-default, .filter-group-custom, .selected-rows-operation {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin: .25rem 0;
        
        button {
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
            background-color: #66666630;
            cursor: pointer;
            transition: background-color 0.3s;
            height: 30px;
            display: flex;
            align-items: center;
            
            &:hover {
                background-color: #66666680;
            }
            
            &.active {
                background-color: #66666680;
            }
            
            img {
                object-fit: contain;
                max-height:100%;
            }
        }
    }
    .table-mode-select{
        min-height: 30px;
        max-width: 100px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin: .25rem;
        background-color: #66666630;
        &:focus-visible {
            outline: none;
        }
    }
    .export-btn {
        min-height: 30px;
        margin: .25rem;
        padding: .0 .5rem;
        border: 1px solid #ccc;
        background-color: #66666630;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s;

        &:hover {
            background-color: #66666680;
        }

        &:disabled {
            background-color: #cccccca0;
            color: #413838;
            cursor: not-allowed;
        }
    }
    .selected-rows-operation{
        min-height: 30px;
    }
</style>