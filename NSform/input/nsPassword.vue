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
const $pw = ref(null);
const $pwc = ref(null);

const emit = defineEmits(["input", "submit"]);

const props = defineProps({
    title: {
        type: [String, null],
        default: null
    },
    length: {
        type: [Number, Array, null],
        default: null
    },
    require: {
        type: Array,
        default: () => []
    },
    useConfirm: {
        type: Boolean,
        default: false
    }
});
const { title, length, require, useConfirm } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.password";

const invalidText = computed(() => {
    if(Array.isArray(length.value) && length.value.length >= 2 && value.value.length < length.value[0] && length.value[1] < value.value.length) {
        return `password length should be between ${length.value[0]} and ${length.value[1]}`;
    } else if(length.value !== null && value.value.length < length.value) {
        return `password length should be longer than ${length.value}`;
    } else if(require !== null && require.value.some(item => value.value.match(item))) {
        return `password should contain ${require.value.join(', ')}`;
    } else {
        return '';
    }
});
const matched = computed(() => {
    return useConfirm.value ? value.value === valueConfirm.value : true;
});

const value = ref('');
const valueConfirm = ref('');

const select = () => {
    console.log(value.value);
    if(invalidText.value || !matched.value) return;
    emit('input', value);
}

const submit = () => {
    console.log(value.value);
    if(invalidText.value || !matched.value) return;
    emit('submit', value);
}

const viewPW = (el) => {
    const input = el.querySelector('input');
    const eye = el.querySelector('i');
    if(input.type === 'password') {
        input.type = 'text';
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
    }
}

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div ref="$el">
        <div ref="$pw" class="ns-pw-input">
            <input class="input-crystal-sky" type="password" v-model="value" @input="select()" @keydown.enter="submit()" :class="{'invalid': invalidText}">
            <i class="fas fa-eye" @click="viewPW($pw)"></i>
            <div>{{ invalidText }}</div>
        </div>
        <div ref="$pwc" class="ns-pw-input-confirm" v-if="useConfirm">
            <input class="input-crystal-sky" type="password" v-model="valueConfirm" @input="select()" @keydown.enter="submit()" :class="{'invalid': !matched}">
            <div>{{ matched ? '' : 'password not match'}}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.ns-pw-input {
    position: relative;

    input {
        width: 100%;
        padding-right: 2rem;
    }

    i {
        position: absolute;
        right: 0;
        top: 0;
        transform: translate(-50%, 50%);
        cursor: pointer;
    }

    > div {
        height: 20px;
    }
}
.ns-pw-input-confirm{

    > div {
        height: 20px;
    }
}
.invalid {
    border-color: red;

    ~div {
        color: red;
        font-size: 0.8rem;
    }
}
</style>