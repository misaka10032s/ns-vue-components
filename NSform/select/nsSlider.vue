<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

gsap.registerPlugin(Draggable);

const $el = ref(null);

const emit = defineEmits(["change", "submit"]);

const props = defineProps({
    title: {
        type: [String, null],
        default: null
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    step: {
        type: Number,
        default: 1
    },
    defaultValue: {
        type: Number,
        default: null
    }
});
const { title, min, max, step, defaultValue } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.select.slider";

const startingValue = ref(defaultValue.value ?? min.value);
const labels = computed(() => {
    const lbs = [];
    const slider = $el.value?.querySelector('.ns-slider');
    const bean = $el.value?.querySelector('.ns-slider-bean');
    if(!bean) return lbs;
    const totalLength = max.value - min.value;
    const sliderLength = slider.offsetWidth;
    const trackLength = sliderLength - bean.offsetWidth;
    // (ratio * trackLength + bean.offsetWidth/2) / totalLength * 100;

    lbs.push({ value: startingValue.value, position: ((startingValue.value - min.value) / totalLength * trackLength + bean.offsetWidth/2) / sliderLength * 100});
    for(let i = 1; i <= Math.floor(totalLength / step.value); i++) {
        const v = i * step.value + startingValue.value;
        lbs.push({ value: v, position: ((v - min.value) / totalLength * trackLength + bean.offsetWidth/2) / sliderLength * 100 });
    }
    // lbs.push({ value: max.value, position: 100});
    return lbs;
});
const value = ref(startingValue.value);
const preValue = ref(value.value);

const change = () => {
    console.log(value.value);
    emit('change', value);
}

const submit = () => {
    console.log(value.value);
    emit('submit', value);
}

watch(() => value.value, (newval, oldval) => {
    if(newval === null) {
        value.value = preValue.value;
    } else {
        preValue.value = oldval;
        change();
    }
});

onMounted(async () => {
    console.log(`@${i18nRoute}`);

    const slider = $el.value.querySelector('.ns-slider');
    const bean = $el.value.querySelector('.ns-slider-bean');

    const totalLength = max.value - min.value;
    const sliderWidth = slider.offsetWidth;
    const trackLength = sliderWidth - bean.offsetWidth;

    Draggable.create(bean, {
        type: "x",
        bounds: slider,
        onPress: function() {},
        onRelease: function() {
            // make the bean snap to the nearest step
            const val = Math.round((value.value - startingValue.value) / step.value) * step.value + startingValue.value;
            const ratio = (val - min.value) / totalLength;
            gsap.to(bean, {x: `${(ratio * trackLength)}`, duration: 0.2});
        },
        onDrag: function() {
            const x = this.x;
            const width = trackLength;
            const ratio = x / width;
            const val = min.value + (max.value - min.value) * ratio;
            value.value = Math.round((val - startingValue.value) / step.value) * step.value + startingValue.value;
        }
    });
});
</script>

<template>
    <div ref="$el">
        <div class="ns-slider-value">{{ value }}</div>
        <div class="ns-slider">
            <div class="ns-slider-bean"></div>
        </div>
        <div class="ns-slider-label">
            <span v-for="lb in labels" :style="`left: ${ lb.position }%;`">{{ lb.value }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.ns-slider {
    position: relative;
    width: 100%;
    height: 10px;
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 0 20px;
    .ns-slider-bean {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background-color: #007bff;
        border-radius: 10px;
        transform: translateY(-25%);

        // vertical center line of the bean
        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 1px;
            height: 20px;
            background-color: #000;
        }
    }
}
.ns-slider-label {
    position: relative;

    span {
        position: absolute;
        transform: translate(-50%, 5px);

        // scale line
        &::before {
            content: '';
            position: absolute;
            top: -5px;
            left: 50%;
            transform: translate(-50%, 0);
            width: 1px;
            height: 10px;
            background-color: #000;
        }
    }
}
</style>