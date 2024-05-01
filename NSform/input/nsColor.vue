<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

import painting from './effect/painting.vue'

const $el = ref(null);

const emit = defineEmits(["input", "submit"]);

const props = defineProps({
    title: {
        type: [String, null],
        default: null
    }
});
const { title } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.color";

// generate random id English characters
const id = ref(Array.from({length: 10}, () => Math.floor(Math.random() * 26 + 65).toString(36)).join(''));

const value = ref("#000000");
const preValue = ref(value.value);

const select = () => {
    console.log(value.value);
    $el.value.querySelector('label').classList.remove('trigger');
    setTimeout(() => {
        $el.value.querySelector('label').classList.add('trigger');
    }, 50);
    emit('input', value);
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
        <p v-if="title">{{ title }}</p>
        <painting :tag="'label'" :for="id" :style="{ '--back_color': value }" class="trigger"></painting>
        <input :id="id" type="color" v-model="value" @input="select()">
    </div>
</template>

<style scoped lang="scss">
input[type="color"] {
    width: 0;
    height: 0;
    padding: 0;
    border: none;
    opacity: 0;
}
</style>