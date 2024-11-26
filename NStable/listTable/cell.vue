<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed, onBeforeUnmount } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from '../tableStore.js'

    import _ from 'lodash'
    gsap.registerPlugin(Draggable);

    const $el = ref(null);

    const props = defineProps({
        tableID: {
            type: String,
            required: true,
        },
        celldata: {
            type: Object,
            default: () => {},
        },
    });
    const { tableID, celldata } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.listTable.cell";


    const actions = computed(() => store.getters.actions(tableID.value));

    const doOperation = (operation, $event, celldata) => {
        store.dispatch("cellInteraction", {tableID: tableID.value, operation, $event, celldata});
    };

    const nowMode = computed(() => store.getters.nowMode(tableID.value));
    const dragItem = ref(null);
    const dataClone = ref([]);

    const initInfo = (el) => {
        // problems:
        // if the transition in mainTable (<transition-group name="list">) is not finished, it will cause position error
        // if the cell is moving, that can't be triggered by the drag event to change the position

        // console.log('initInfo', el);
        if(el == $el.value) el.data = celldata.value;
        if(el.parentElement) el.index = [...el.parentElement.children].indexOf(el);
        el.startX = el.offsetLeft;
        el.startY = el.offsetTop;
    }

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
        initInfo($el.value);

        const cells = store.getters.cells(tableID.value);

        const onDrag = (e) => {
            // console.log('dragging', e);
            for(let i = 0; i < cells.length; i++){
                const myCell = $el.value;
                const myIndex = myCell.index;
                const targetCell = cells[i];
                const targetIndex = targetCell.index;

                if(cells[i] != e.target && dragItem.value[0].hitTest(cells[i], "25%") && !targetCell.isMoving){
                    console.log('hit', [...cells].map(x => x.index));

                    console.log('hittttt ', e.target, myIndex, targetIndex, myCell, targetCell);

                    if(nowMode.value === 1){
                        if(myIndex < targetIndex) {
                            // change the info of effected cells
                            const [lastEffectedCellX, lastEffectedCellY, lastEffectedCellindex] = [targetCell.startX, targetCell.startY, targetIndex];
                            for(let j = targetIndex; j > myIndex; j--){
                                const cell = cells[j];
                                const prevCell = cells[j-1];

                                const dx = prevCell.startX - cell.startX;
                                const dy = prevCell.startY - cell.startY;

                                cell.startX = prevCell.startX;
                                cell.startY = prevCell.startY;
                                cell.index = prevCell.index;

                                cell.isMoving = true;
                                gsap.to(cell, {
                                    x: `+=${dx}`,
                                    y: `+=${dy}`,
                                    duration: 0.5,
                                    ease: "power2.out",
                                    onComplete: () => {
                                        cell.isMoving = false;
                                    }
                                });
                            }
                            myCell.startX = lastEffectedCellX;
                            myCell.startY = lastEffectedCellY;
                            myCell.index = lastEffectedCellindex;

                            // insert to the front of target
                            store.state.cells[tableID.value].splice(targetIndex, 0, store.state.cells[tableID.value].splice(myIndex, 1)[0]);
                            store.state.dragObj[tableID.value].splice(targetIndex, 0, store.state.dragObj[tableID.value].splice(myIndex, 1)[0]);
                            const myDataIndex = _.indexOf(dataClone.value, myCell.data);
                            const targetDataIndex = _.indexOf(dataClone.value, targetCell.data);
                            dataClone.value.splice(targetDataIndex, 0, dataClone.value.splice(myDataIndex, 1)[0]);
                            // console.log([...cells].map(x => x.index));
                        }
                        else {
                            // change the info of effected cells
                            const [firstEffectedCellX, firstEffectedCellY, firstEffectedCellindex] = [targetCell.startX, targetCell.startY, targetIndex];
                            for(let j = targetIndex; j < myIndex; j++){
                                const cell = cells[j];
                                const nextCell = cells[j+1];

                                const dx = nextCell.startX - cell.startX;
                                const dy = nextCell.startY - cell.startY;

                                cell.startX = nextCell.startX;
                                cell.startY = nextCell.startY;
                                cell.index = nextCell.index;

                                cell.isMoving = true;
                                gsap.to(cell, {
                                    x: `+=${dx}`,
                                    y: `+=${dy}`,
                                    duration: 0.5,
                                    ease: "power2.out",
                                    onComplete: () => {
                                        cell.isMoving = false;
                                    }
                                });
                            }
                            myCell.startX = firstEffectedCellX;
                            myCell.startY = firstEffectedCellY;
                            myCell.index = firstEffectedCellindex;

                            // insert to the back of target
                            store.state.cells[tableID.value].splice(targetIndex, 0, store.state.cells[tableID.value].splice(myIndex, 1)[0]);
                            store.state.dragObj[tableID.value].splice(targetIndex, 0, store.state.dragObj[tableID.value].splice(myIndex, 1)[0]);
                            const myDataIndex = _.indexOf(dataClone.value, myCell.data);
                            const targetDataIndex = _.indexOf(dataClone.value, targetCell.data);
                            dataClone.value.splice(targetDataIndex, 0, dataClone.value.splice(myDataIndex, 1)[0]);
                            // console.log([...cells].map(x => x.index));
                        }
                    }
                    else if(nowMode.value === 3){
                        // change the info of effected cells
                        const cell = cells[targetIndex];

                        const dx = myCell.startX - cell.startX;
                        const dy = myCell.startY - cell.startY;

                        cell.isMoving = true;
                        gsap.to(cell, {
                            x: dx,
                            y: dy,
                            duration: 0.5,
                            ease: "power2.out",
                            onComplete: () => {
                                cell.isMoving = false;
                            }
                        });

                        [myCell.startX, targetCell.startX] = [targetCell.startX, myCell.startX];
                        [myCell.startY, targetCell.startY] = [targetCell.startY, myCell.startY];
                        
                        // swap the data
                        [store.state.cells[tableID.value][myIndex], store.state.cells[tableID.value][targetIndex]] = [store.state.cells[tableID.value][targetIndex], store.state.cells[tableID.value][myIndex]];
                        [store.state.dragObj[tableID.value][myIndex], store.state.dragObj[tableID.value][targetIndex]] = [store.state.dragObj[tableID.value][targetIndex], store.state.dragObj[tableID.value][myIndex]];
                        const myDataIndex = _.indexOf(dataClone.value, myCell.data);
                        const targetDataIndex = _.indexOf(dataClone.value, targetCell.data);
                        [dataClone.value[myDataIndex], dataClone.value[targetDataIndex]] = [dataClone.value[targetDataIndex], dataClone.value[myDataIndex]];
                    }

                    // console.log('dataClone.value', dataClone.value.map(x => x.id));
                    break;
                }
            }
        }
        const onPress = (e) => {
            console.log(e, cells, cells.indexOf(e.target));

            dataClone.value = store.getters.data(tableID.value).slice();
        }
        const onRelease = (e) => {
            console.log(e);
            console.log([...store.state.data[tableID.value]].map(x => x.id));
            console.log([...dataClone.value].map(x => x.id));

            // update the data
            store.state.data[tableID.value] = dataClone.value.slice();

            // reset the position of the dragging item
            cells.forEach(cell => {
                // if cell is moving, skip
                // if(cell.isMoving) return;
                initInfo(cell);
                gsap.killTweensOf(cell);
                cell.isMoving = false;
                gsap.to(cell, {
                    x: 0,
                    y: 0,
                    duration: 0.00001,
                    ease: "power2.out",
                    onComplete: () => {
                        cell.startX = cell.offsetLeft;
                        cell.startY = cell.offsetTop;
                    }
                });
            });
            cells.sort((a, b) => a.index - b.index);
            console.log([...cells].map(x => x.index));
        }

        dragItem.value = Draggable.create($el.value, {
            onDrag: onDrag,
            onPress: onPress,
            onRelease: onRelease,
            zIndexBoost: false
        });

        store.state.cells[tableID.value].push($el.value);
        store.state.dragObj[tableID.value].push(dragItem.value[0]);
        
        if(nowMode.value !== 1 && nowMode.value !== 3) dragItem.value[0].disable();
    });

    onUpdated(() => {
        console.log('updated');

        initInfo($el.value);
    });

    onBeforeUnmount(() => {
        console.log('unmounted');

        store.state.cells[tableID.value] = store.state.cells[tableID.value].filter(item => item !== $el.value);
        store.state.dragObj[tableID.value] = store.state.dragObj[tableID.value].filter(item => item !== dragItem.value[0]);
    });

    watch(() => nowMode.value, (nowMode) => {
        if(nowMode === 1 || nowMode === 3){
            dragItem.value[0].enable();
        } else {
            dragItem.value[0].disable();
        }
    });
</script>

<template>
    <div ref="$el" class="list-cell" @click="doOperation(actions?.click, $event, celldata)" @contextmenu="doOperation(actions?.contextmenu, $event, celldata)">
        <div class="cell-select" v-if="nowMode === 2">
            <input type="checkbox" v-model="celldata._selected">
        </div>
        <div>
            <!-- @@@@ custom field -->
            {{ celldata }}
        </div>
    </div>
</template>

<style scoped lang="scss">
.list-cell{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: .5rem;
    min-width: 100px;
    max-width: 100px;
    height: 100px;
    overflow: hidden;
    border: 1px solid black;
}
.cell-select{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;

    input {
        cursor: pointer;
    }
}
</style>