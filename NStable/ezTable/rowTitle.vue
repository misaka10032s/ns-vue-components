<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from '../tableStore.js'

    import _ from 'lodash'
    gsap.registerPlugin(Draggable);

    import cellTitle from './cellTitle.vue';

    const $el = ref(null);
    const $titles = ref(null);

    const props = defineProps({
        showCheckbox: {
            type: Boolean,
            default: false,
        },
    });
    const { showCheckbox } = toRefs(props);
    const { t, locale } = useI18n();

    const emit = defineEmits(["switchPageAll", "switchAll"]);

    const i18nRoute = "NSeztable.row";

    const dragItemList = ref([]);

    const nowMode = computed(() => store.getters.nowMode);
    watch(() => store.getters.nowMode, (nowMode) => {

        if(nowMode===1){
            dragItemList.value.forEach((item) => {
                item[0].enable();
            });
        } else {
            dragItemList.value.forEach((item) => {
                item[0].disable();
            });
        }
    });

    onMounted(async () => {
        console.log(`@${i18nRoute}`, $titles.value, $titles.value[0].$el);

        // deep copy the title order
        const tmpTitleOrder = _.cloneDeep(store.getters.titleOrder);
        // register draggable for each row
        [...$titles.value].forEach((_row, index) => {
            const row = _row.$el;

            row.startX = row.offsetLeft;
            row.index = index;

            const dragItem = Draggable.create(row, {
                type: "x",
                bounds: row.parentNode,
                onPress: function() {
                    console.log('drag start', this.target.startX, this.target.offsetWidth);
                    // make the dragging item to shadow
                    gsap.to(this.target, { zIndex: 100, backgroundColor: "rgba(0, 0, 0, 0.1)"}, 0.5);
                },
                onRelease: function() {
                    // justify the position
                    [...$titles.value].forEach((r, i) => {
                        // cancel existing hoving effect
                        gsap.killTweensOf(r.$el);

                        gsap.to(r.$el, { x: 0, duration: 0.001, backgroundColor: "rgba(0, 0, 0, 0)" });
                        r.$el.isHoving = false;
                        r.$el.startX = r.$el.offsetLeft;
                        r.$el.index = i;
                    });
                    store.state.titleOrder = _.cloneDeep(tmpTitleOrder);

                    gsap.to(this.target, { zIndex: 0, backgroundColor: "" }, 0.2);
                },
                onDrag: function(event) {
                    // check if item hit another item
                    for(let i = 0; i < $titles.value.length; i++){
                        if(Math.abs(this.target.index - $titles.value[i].$el.index) != 1) continue;

                        // check if dragging item is at the side of the target item to go
                        const centerOfTarget = $titles.value[i].$el.getBoundingClientRect().left + $titles.value[i].$el.offsetWidth / 2;
                        const centerOfSelf = this.target.getBoundingClientRect().left + this.target.offsetWidth / 2;
                        const cursorLocation = event.clientX;

                        const isOverHalf = ($titles.value[i].$el.startX - this.target.startX) * (centerOfTarget - cursorLocation) < 0;
                        const isCursorEnter = Math.abs(centerOfTarget - cursorLocation) <= $titles.value[i].$el.offsetWidth / 2;
                        
                        // if the dragging item is hoving on another item, change the background color
                        if(isCursorEnter){
                            if(!$titles.value[i].isHoving){
                                $titles.value[i].isHoving = true;
                                gsap.to($titles.value[i].$el, {
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    duration: 0.5,
                                    onComplete: () => {
                                        $titles.value[i].isHoving = false;
                                    }
                                });
                            }
                        }
                        else {
                            $titles.value[i].isHoving = false;
                            gsap.to($titles.value[i].$el, {
                                backgroundColor: "rgba(0, 0, 0, 0)",
                                duration: 0.5,
                            });
                        }

                        // if the dragging item hit another item, swap the position
                        if(this.hitTest($titles.value[i].$el, "30%") && !$titles.value[i].isMoving){
                            if(!isOverHalf) continue;

                            $titles.value[i].isMoving = true;
                            console.log('hit', i, this.target.startX, $titles.value[i].$el.startX)

                            const dxTarget = $titles.value[i].$el.startX < this.target.startX ? this.target.offsetWidth : -this.target.offsetWidth;
                            const dxSelf = this.target.startX < $titles.value[i].$el.startX ? -$titles.value[i].$el.offsetWidth : $titles.value[i].$el.offsetWidth;

                            gsap.to($titles.value[i].$el, {
                                x: `+=${dxTarget}`,
                                duration: 0.3,
                                ease: "power1.inOut",
                                onComplete: () => {
                                    $titles.value[i].isMoving = false;
                                    console.log('hit complete', $titles.value[i].$el.startX, $titles.value[i].$el.offsetLeft);
                                }
                            });
                            
                            // swap the title order
                            const tmp = tmpTitleOrder[this.target.index];
                            tmpTitleOrder[this.target.index] = tmpTitleOrder[$titles.value[i].$el.index];
                            tmpTitleOrder[$titles.value[i].$el.index] = tmp;

                            this.target.startX -= dxTarget;
                            $titles.value[i].$el.startX += dxSelf;

                            const tmp2 = this.target.index;
                            this.target.index = $titles.value[i].$el.index;
                            $titles.value[i].$el.index = tmp2;
                        }
                    }
                }
            });

            dragItem[0].disable();
            dragItemList.value.push(dragItem);
        });
    });
</script>

<template>
    <tr ref="$el" class="title-row" :class="{'title-view': nowMode==0, 'title-drag': nowMode==1, 'title-select': nowMode==2, 'title-delete': nowMode==3}">
        <th class="sysetm-title" v-if="nowMode===1"></th>
        <th class="sysetm-title" v-if="nowMode===2">
            <input class="action-checkbox" type="checkbox" @change="$event => emit('switchPageAll', $event.target.checked)"/>
        </th>
        <th class="sysetm-title" v-if="nowMode===3"></th>
        <cellTitle ref="$titles" v-for="(column, index) in store.getters.titleOrder" :column="column"/>
    </tr>
</template>

<style scoped lang="scss">
.title-row{
    background-color: #cccccc90;
    th:first-child {
        border-top-left-radius: 0.5rem;
    }
    th:last-child {
        border-top-right-radius: 0.5rem;
    }
}
.title-view {
    th {
        cursor: pointer;

        &:hover {
            background-color: #cccccc90;
        }
    }
}
.title-drag{
    :not(.sysetm-title) {
        cursor: move !important;
    }
}
.action-checkbox {
    display: block;
    margin: 0 auto;
    cursor: pointer;
}
</style>