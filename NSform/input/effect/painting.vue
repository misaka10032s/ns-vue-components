<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

const $el = ref(null);

const emit = defineEmits(["change", "submit"]);

const props = defineProps({
    active: {
        type: Boolean,
        default: false
    },
    tag: {
        type: String,
        default: 'div'
    }
});
const { active, tag } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.effect.painting";

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <component ref="$el" :is="tag" class="painting">
        <div class="drawing-button__drow1"></div>
        <div class="drawing-button__drow2"></div>
    </component>
</template>

<style scoped lang="scss">
$scale : 0.4;

.painting {
    position: relative;
    z-index: 0;
    width: $scale * 240px;
    height: $scale * 56px;
    text-decoration: none;
    font-size: 16px;
    font-weight: bold;
    color: var(--line_color);
    letter-spacing: 1px;
    transition: all 0.3s ease;
    // &:hover, 
    &.trigger{
        letter-spacing: 2px;
      
        &::before, .drawing-button__text::before {
          width: 8px;
        }
      
        &::after, .drawing-button__text::after {
          width: calc( 100% - $scale * 56px * 2 - $scale * 16px );
        }
        .drawing-button__drow1 {
            animation: drow1 ease-in 0.06s;
            animation-fill-mode: forwards;
        
            &::before {
                animation: drow2 linear 0.08s 0.06s;
                animation-fill-mode: forwards;
            }
        
            &::after {
                animation: drow3 linear 0.03s 0.14s;
                animation-fill-mode: forwards;
            }
        }
      
        .drawing-button__drow2 {
            animation: drow4 linear 0.06s 0.2s;
            animation-fill-mode: forwards;
        
            &::before {
                animation: drow3 linear 0.03s 0.26s;
                animation-fill-mode: forwards;
            }
        
            &::after {
                animation: drow5 linear 0.06s 0.32s;
                animation-fill-mode: forwards;
            }
        }
    }
    .drawing-button__drow1, .drawing-button__drow2 {
        position: absolute;
        z-index: -1;
        border-radius: $scale * 16px;
        transform-origin: $scale * 16px $scale * 16px;
    }
    .drawing-button__drow1 {
        top: $scale * -16px;
        left: $scale * 40px;
        width: $scale * 32px;
        height: 0;
        transform: rotate(30deg);
        background: var(--back_color);

        &::before, &::after {
            content: "";
            position: absolute;
            background: var(--back_color);
        }

        &::before {
            bottom: 0;
            left: 0;
            width: 0;
            height: $scale * 32px;
            border-radius: $scale * 16px;
            transform-origin: $scale * 16px $scale * 16px;
            transform: rotate(-60deg);
        }
    
        &::after {
            top: $scale * -10px;
            left: $scale * 45px;
            width: 0;
            height: $scale * 32px;
            border-radius: $scale * 16px;
            transform-origin: $scale * 16px $scale * 16px;
            transform: rotate(69deg);
        }
    }
    .drawing-button__drow2 {
        top: $scale * 44px;
        left: $scale * 77px;
        width: $scale * 32px;
        height: 0;
        transform: rotate(-127deg);
        background: var(--back_color);

        &::before, &::after {
            content: "";
            position: absolute;
            background: var(--back_color);
        }

        &::before {
            bottom: 0;
            left: 0;
            width: 0;
            height: $scale * 32px;
            border-radius: $scale * 16px;
            transform-origin: $scale * 16px $scale * 16px;
            transform: rotate(-146deg);
        }
    
        &::after {
            bottom: $scale * 26px;
            left: $scale * -40px;
            width: 0;
            height: $scale * 32px;
            border-radius: $scale * 16px;
            transform-origin: $scale * 16px $scale * 16px;
            transform: rotate(-262deg);
        }
    }
}

@keyframes drow1{
    0%   { height : 0 ; }
    100% { height : $scale * 100px ; }
}
@keyframes drow2{
    0%   { width : 0 ; opacity : 0 ;}
    10%  { opacity : 0 ;}
    11%  { opacity : 1 ;}
    100% { width : $scale * 120px ; }
}
@keyframes drow3{
    0%   { width : 0 ; }
    100% { width : $scale * 80px ; }
}
@keyframes drow4{
    0%   { height : 0 ; }
    100% { height : $scale * 120px ; }
}
@keyframes drow5{
    0%   { width : 0 ; }
    100% { width : $scale * 124px ; }
}
</style>