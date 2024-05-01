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

const emit = defineEmits(["input", "submit"]);

const props = defineProps({
    title: {
        type: [String, null],
        default: null
    },
    min: {
        type: [Number, null],
        default: null
    },
    max: {
        type: [Number, null],
        default: null
    },
});
const { title, min, max } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.number";

const value = ref(null);
const preValue = ref(value.value);

// make the value correct
const correctValue = v => {
    const n = isNaN(Number(v)) ? 0 : Number(v);
    return Math.max(min.value, Math.min(max.value, n));
}

const select = () => {
    console.log(value.value);
    // value.value = correctValue(value.value);
    emit('input', value);
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
        <input class="input-crystal-sky" v-model.number="value" @change="select()" @keydown.enter="submit()">
    </div>
</template>

<style scoped lang="scss">
input:focus-visible{
    outline: none;
}
</style>