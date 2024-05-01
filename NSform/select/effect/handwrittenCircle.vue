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
});
const { active } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.select.effect.handwrittenCircle";

var widthGain = 1; // 1 default
var heightGain = 1; // 1 default

const setCircle = (show_element) => {
    const path = $el.value.querySelector("path");
    if (show_element) {
        path.style.visibility = "visible";
    } else {
        path.style.visibility = "hidden";
    }
    
    var pathLength = 1000 * path.getTotalLength();
    
    // Set path attributes and styles
    path.setAttribute("d", circlePath(-0.15,0.05,150,190,0.05,0.3));
    path.setAttribute("stroke-dasharray", pathLength);
    path.setAttribute("stroke-dashoffset", pathLength);
}

// animation for checked effect
const circlePath = (dr_min, dr_max, θ0_min, θ0_max, dθ_min, dθ_max) => {
    var c = 0.551915024494,
    β = Math.atan(c),
    d = Math.sqrt(c * c + 1 * 1),
    r = 0.9,
    θ = ((θ0_min + Math.random() * (θ0_max - θ0_min)) * Math.PI) / 180,
    path = "M";

    path += [r * Math.sin(θ), r * Math.cos(θ)];
    path += " C" + [d * r * Math.sin(θ + β), d * r * Math.cos(θ + β)];

    for (var i = 0; i < 4; i++) {
    θ += (Math.PI / 2) * (1 + dθ_min + Math.random() * (dθ_max - dθ_min));
    r *= 1 + dr_min + Math.random() * (dr_max - dr_min);
    path +=
        " " +
        (i ? "S" : "") +
        [d * r * Math.sin(θ - β), d * r * Math.cos(θ - β)];
    path += " " + [r * Math.sin(θ), r * Math.cos(θ)];
    }
    return path;
}

onMounted(async () => {
    console.log(`@${i18nRoute}`);
    const width = $el.value.parentNode.offsetWidth;
    const height = 2 * $el.value.parentNode.offsetHeight;
    $el.value.style.transform = `scale(${2 * widthGain * width / height}, ${heightGain})`;
    setCircle(false);
    setTimeout(() => {
        setCircle(false);
    }, 10);
    setTimeout(() => {
        const path = $el.value.querySelector("path");
        path.style.visibility = "visible";
    }, 500);
});
</script>

<template>
    <svg ref="$el" viewBox="-1 -1 2 2" width="63.9531" height="74">
        <path pathLength="100" vector-effect="non-scaling-stroke" :class="{active}"></path>
    </svg>
</template>

<style scoped lang="scss">
svg {
    pointer-events: none;
}
path {
    transition: stroke-dashoffset 300ms linear;
    stroke-width: 1;
    stroke: #67b33c;
    fill: none;
    stroke-linecap: round;

    &.active{
        stroke-dashoffset: 0;
    }
}
</style>

<!-- 
    referece:
        https://codepen.io/Veng1/pen/QWKaRON
 -->