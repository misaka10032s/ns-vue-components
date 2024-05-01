<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

import handwrittenCircle from './effect/handwrittenCircle.vue'

const $el = ref(null);

const emit = defineEmits(["change", "submit"]);

const props = defineProps({
    title: {
        type: [String, null],
        default: null
    },
    options: {
        type: Array,
        default: () => []
    },
    fill: {
        type: Boolean,
        default: false
    },
});
const { title, options, fill } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.select.checkbox";

// generate random id English characters
const id = ref(Array.from({length: 10}, () => Math.floor(Math.random() * 26 + 65).toString(36)).join(''));
const value = ref({});
const preValue = ref(value.value);
const hover = ref({});

// make the value correct
const correctValue = v => {
    return Object.keys(v).reduce((acc, key) => {
        if(v[key]) acc[key] = v[key];
        return acc;
    }, {});
}

const change = () => {
    console.log(value.value);
    value.value = correctValue(value.value);
    emit('change', value);
}

const submit = () => {
    console.log(value.value);
    value.value = correctValue(value.value);
    emit('submit', value);
}

watch(() => value.value, (newval, oldval) => {
    if(newval === null) {
        value.value = preValue.value;
    } else {
        preValue.value = oldval;
    }
});


onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div ref="$el">
        <template v-for="item in options">
            <!-- if contains name, use group -->
            <div v-if="item.name" class="ns-form-check-wrapper">
                <h4>{{ item.name }}</h4>
                <label v-for="option in item.options" class="ns-form-check" :class="{'active': value[option.value], 'fill-line': fill}" :for="option.label + id" @mouseenter="hover[option.value]=1" @mouseleave="hover[option.value]=0">
                    <input class="ns-form-check-input" type="checkbox" :id="option.label + id" :value="option.value" v-model="value[option.value]" @change="change">
                    <handwrittenCircle class="handwrittenCircle" :active="value[option.value]"></handwrittenCircle>
                    {{ option.label }}
                </label>
            </div>
            <!-- if not contains name, use single -->
            <label v-else class="ns-form-check" :class="{'active': value[item.value], 'fill-line': fill}" :for="item.label + id" @mouseenter="hover[item.value]=1" @mouseleave="hover[item.value]=0">
                <input class="ns-form-check-input" type="checkbox" :id="item.label + id" :value="item.value" v-model="value[item.value]" @change="change">
                <handwrittenCircle class="handwrittenCircle" :active="value[item.value]"></handwrittenCircle>
                {{ item.label }}
            </label>
        </template>
    </div>
</template>

<style scoped lang="scss">

$duration-x: .5s;

$border-color: #6dc5d1;
$border-color-active: #309be2;

input {
    display: none;
}

// button style, gray for unselected, light blue for selected, hover and select effect
.ns-form-check {
    position: relative;
    cursor: pointer;
    padding: 0.5rem 1rem;
    margin: .25rem .125rem;
    border-radius: 0.25rem;
    background-color: transparent;
    transition: background-color 0.3s;

    &.fill-line{
        width: 100%;
    }
}

.handwrittenCircle{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

</style>