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
    }
});
const { title } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.email";

const invalid = computed(() => {
    return !value.value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
});
const value = ref('');
const preValue = ref(value.value);

const select = () => {
    console.log(value.value);
    if(invalid.value) return;
    emit('input', value);
}

watch(() => value.value, (newval, oldval) => {
    if(invalid.value) return;
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
    <div ref="$el" class="email-input">
        <input class="input-crystal-sky" type="email" v-model="value" @input="select()" :class="{'invalid': invalid}" placeholder="address@example.com"/>
        <div v-if="invalid">Invalid email address</div>
    </div>
</template>

<style scoped lang="scss">
.email-input > *{
    transition: .5s;
}
input:focus-visible{
    outline: none;
}
.invalid {
    border-color: red;

    ~div {
        color: red;
        font-size: 0.8rem;
    }
}
</style>