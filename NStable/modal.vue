<script setup>
    import { useI18n } from 'vue-i18n'

    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { gsap, Draggable } from 'gsap/all'
    
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import Swal from 'sweetalert2'

    import store from './tableStore.js'

    import detail from './modal/detail.vue'
    import editing from './modal/editing.vue'

    const $el = ref(null);
    const $block = ref(null);

    const props = defineProps({
        tableID: {
            type: String,
            required: true,
        },
        movable: {
            type: Boolean,
            default: true
        }
    });
    const { tableID, movable } = toRefs(props);
    const { t, locale } = useI18n();

    const i18nRoute = "NSeztable.modal";

    const myDraggable = ref(null);
    const moveStatus = ref(false);
    const moveSwitch = () => {
        moveStatus.value = !moveStatus.value;
        if (moveStatus.value) {
            myDraggable.value[0].enable();
        } else {
            myDraggable.value[0].disable();
            // set it to the original position
            gsap.to($block.value, { x: 0, y: 0, duration: 0.2 });
        }
    }

    const close = () => {
        store.state.viewingRow[tableID.value] = null;
        store.state.editingRow[tableID.value] = null;
    }

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
        
        myDraggable.value = Draggable.create($block.value, {
            // onDrag: onDrag,
            // onPress: onPress,
            onRelease: () => {
                // prevent put out of page
                const position = $block.value.getBoundingClientRect();
                const W=position.width, H=position.height;
                const stayRate = 0.3, WS=position.width*stayRate, HS=position.height*stayRate;
                if (position.left < WS-W) {
                    gsap.to($block.value, { x: "+=" + (WS-W - position.left), duration: 0.2 });
                }
                else if (position.right > window.innerWidth-WS+W) {
                    gsap.to($block.value, { x: "+=" + ((window.innerWidth-WS+W) - position.right), duration: 0.2 });
                }
                if (position.top < HS-H) {
                    gsap.to($block.value, { y: "+=" + (HS-H - position.top), duration: 0.2 });
                }
                else if (position.bottom > window.innerHeight-HS+H) {
                    gsap.to($block.value, { y: "+=" + ((window.innerHeight-HS+H) - position.bottom), duration: 0.2 });
                }
            },
            zIndexBoost: false
        });
        myDraggable.value[0].disable();
    });
</script>

<template>
    <div ref="$el" class="floating-zone">
        <div class="ground" @click="close()"></div>
        <div ref="$block" class="floating-block">
            <div class="floating-menu">
                <button @click="moveSwitch()" v-if="movable">
                    <i class="fas fa-arrows-alt" v-if="!moveStatus"></i>
                    <i class="fas fa-lock" v-else></i>
                </button>
                <button @click="close()"><i class="fas fa-times"></i></button>
            </div>
            <div class="floating-content">
                <detail v-if="store.getters.viewingRow(tableID)" :tableID="tableID"></detail>
                <editing v-else-if="store.getters.editingRow(tableID)" :tableID="tableID"></editing>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.ground{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #00000080;
    backdrop-filter: blur(3px);
}
.floating-zone{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    align-items: center;
    z-index: 100;

    .floating-block {
        position: absolute;
        display: flex;
        padding: .5rem;
        flex-direction: column;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        background-color: #f0c8ba;
        border-radius: 10px;
        overflow: auto;
        // blur the border 
        box-shadow: 0 0 5px 3px #f0c8ba;

        .floating-menu {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 0.25rem 0.5rem;

            button {
                margin: 0 0.25rem;
                width: 32px;
                height: 32px;
                background-color: #fff;
                cursor: pointer;
                background-color: transparent;
                border: none;
                border-radius: 5px;
                transition: background-color 0.3s;

                &:hover{
                    background-color: #22222240;
                }
            }
        }
    }

    .floating-content{
        padding: .5rem 1rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
}
</style>