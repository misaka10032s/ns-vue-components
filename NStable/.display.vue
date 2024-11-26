<script setup>
    import { useI18n } from 'vue-i18n'
    import store from '@/store/serverStore.js'
    import { useRoute, useRouter } from 'vue-router'

    import { url_for } from '@/router/routerSetting.js'
    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import ezTable from './ezTable.vue'
    import listTable from './listTable.vue'

    const $el = ref(null);

    const props = defineProps({
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "NStable.display";

    const titleOrder = ["id", {key: "name", text: "名字", editable: true}, {key: "age", text: "年齡", editable: true}, ["color", "shape"]];
    // generate data {id: ..., name: ..., age: ...}

    const generateData = () => {
        return {
            // tableID: "table1",
            data: Array.from({length: 11}, (v, k) => {return {"id": k, "name": `name${k}`, "age": Math.floor(Math.random() * 100) + 1, "color": ["red", "green", "blue"][Math.floor(Math.random() * 3)], "shape": ["circle", "square", "triangle"][Math.floor(Math.random() * 3)]}}),
            titleOrder: titleOrder,
            filters: [
                {
                    "id": "less10",
                    "name": "小於10",
                    "func": (row) => {
                        console.log(`less10 ${row}`);
                        return row.age < 10;
                    },
                    "group": "a",
                },
                {
                    "id": "more50",
                    "name": "大於50",
                    "func": (row) => {
                        console.log(`more50 ${row}`);
                        return row.age > 50;
                    },
                    "icon": "fas fa-rocket",
                    "text": "大於50ㄉ",
                },
                {
                    "id": "random",
                    "name": "隨機",
                    "func": (row) => {
                        console.log(`detail ${row}`);
                        return Math.random() > 0.5;
                    },
                    "image": "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                }
            ],
            select: [
                {
                    "id": "delete",
                    "name": "刪除",
                    "func": (selectedRows) => {
                        console.log(`delete ${selectedRows}`);
                        return 1;
                    },
                    // delete icon
                    "icon": "fas fa-trash-alt"
                },
                {
                    "id": "start",
                    "name": "開始",
                    "func": (selectedRows) => {
                        console.log(`start ${selectedRows}`);
                        return 2;
                    },
                    "icon": "fas fa-play"
                },
                {
                    "id": "end",
                    "name": "結束",
                    "func": (selectedRows) => {
                        console.log(`end ${selectedRows}`);
                        return 3;
                    },
                    "icon": "fas fa-stop"
                },
                {
                    "id": "reverse",
                    "name": "反轉",
                    "func": (selectedRows) => {
                        console.log(`reverse ${selectedRows}`);
                        return 4;
                    },
                    "icon": "fas fa-undo"
                },
            ],
            actions: {
                click: ($event, nowMode, row, col) => {
                    console.log("click", $event, nowMode, row, col);
                    if(row.id === 0) {
                        // go to the page with same url but replace the query name with row.name
                        router.push(url_for(null, null, {name: row.name}));
                    }
                    else{
                        return 0;
                    }
                },
                contextmenu: ($event, nowMode, row, col) => {
                    console.log("contextmenu", $event, nowMode, row, col);
                    $event.preventDefault();
                    return 1;
                },
            },
            tableMode: 0,
        };
    }

    const displayConfig = ref(generateData());

    const nodata = () => {
        console.log("nodata");
        displayConfig.value.data = Array.from({length: 11}, (v, k) => {return {"id": k, "name": `name${k}`, "age": Math.floor(Math.random() * 100) + 1, "color": ["red", "green", "blue"][Math.floor(Math.random() * 3)], "shape": ["circle", "square", "triangle"][Math.floor(Math.random() * 3)]}});
    };

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });

    /* Features:
        *sorting
        *search & filter
        *pagination
        actions (edit, delete, etc. + custom filter)
        click to show detail in modal (modal is movable, resizable, and draggable)
        fetch data from server (with loading animation)
    */
</script>

<template>
    <div ref="$el">
        <div class="mx-auto w-75">
            <div class="d-flex align-items-center w-50">
                <p class="mx-2 my-0 text-nowrap">外部控制內部顯示方式</p>
                <select v-model="displayConfig.tableMode" class="form-select">
                    <option :value="0">檢視 (外部)</option>
                    <option :value="1">編輯 (外部)</option>
                    <option :value="2">選擇 (外部)</option>
                    <option :value="3">移動 (外部)</option>
                </select>
            </div>
            <ezTable :config="displayConfig" @nodata="nodata"></ezTable>
            <listTable :config="displayConfig" @nodata="nodata"></listTable>
        </div>
    </div>
</template>

<style scoped lang="scss">
</style>