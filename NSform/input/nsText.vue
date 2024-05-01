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
    length: {
        type: [Number, null],
        default: null
    },
});
const { title, length } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.text";

const value = ref(null);
const preValue = ref(value.value);

// make the value correct
const correctValue = v => {
    return v.slice(0, length.value);
}

const select = () => {
    console.log(value.value);
    value.value = correctValue(value.value);
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
        <input class="input-crystal-sky" type="text" v-model="value" @input="select()" @keydown.enter="submit()">
    </div>
</template>

<style scoped lang="scss">
</style>