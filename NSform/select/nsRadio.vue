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

const i18nRoute = "NSform.select.radio";

// generate random id English characters
const id = ref(Array.from({length: 10}, () => Math.floor(Math.random() * 26 + 65).toString(36)).join(''));
const value = ref('');
const preValue = ref(value.value);
const hover = ref({});

// make the value correct

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
                <label v-for="option in item.options" class="ns-form-check" :class="{'active': value==option.value, 'fill-line': fill}" :for="option.label + id" @mouseenter="hover[option.value]=1" @mouseleave="hover[option.value]=0">
                    <input class="ns-form-check-input" type="radio" :id="option.label + id" :value="option.value" v-model="value" @change="change" :name="id">
                    <transition name="round-select">
                        <div class="border-1" v-if="hover[option.value]"></div>
                    </transition>
                    <transition name="round-select">
                        <div class="border-2" v-if="value==option.value"></div>
                    </transition>
                    {{ option.label }}
                </label>
            </div>
            <!-- if not contains name, use single -->
            <label v-else class="ns-form-check" :class="{'active': value==item.value, 'fill-line': fill}" :for="item.label + id" @mouseenter="hover[item.value]=1" @mouseleave="hover[item.value]=0">
                <input class="ns-form-check-input" type="radio" :id="item.label + id" :value="item.value" v-model="value" @change="change" :name="id">
                <transition name="round-select">
                    <div class="border-1" v-if="hover[item.value]"></div>
                </transition>
                <transition name="round-select">
                    <div class="border-2" v-if="value==item.value"></div>
                </transition>
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

.round-select-enter-active {
    animation: border-close $duration-x linear; // this is required for transition otherwise it will end immediately
    &::before, &::after{
        animation: border-close $duration-x linear;
    }
}
.round-select-leave-active {
    animation: border-close calc($duration-x / 2) linear; // same as above
    &::before, &::after{
        animation: border-close calc($duration-x / 2) linear;
        animation-direction: reverse;
    }
}
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

    .border-1 {
        &::before, &::after{
            content: "";
            position: absolute;
            left: 50%;
            width: 100%;
            height: 60%;
            transform: translateX(-50%);
            border-left: 2px solid $border-color;
            border-right: 2px solid $border-color;
            z-index: 1;
        }

        &::before{
            top: 0;
            border-top: 2px solid $border-color;
            border-radius: 0.25rem 0.25rem 0 0;
        }

        &::after{
            bottom: 0;
            border-bottom: 2px solid $border-color;
            border-radius: 0 0 0.25rem 0.25rem;
        }
    }
    .border-2 {
        &::before, &::after{
            content: "";
            position: absolute;
            left: 50%;
            width: 100%;
            height: 60%;
            transform: translateX(-50%);
            border-left: 2px solid $border-color-active;
            border-right: 2px solid $border-color-active;
            z-index: 1;
        }

        &::before{
            top: 0;
            border-top: 2px solid $border-color-active;
            border-radius: 0.25rem 0.25rem 0 0;
        }

        &::after{
            bottom: 0;
            border-bottom: 2px solid $border-color-active;
            border-radius: 0 0 0.25rem 0.25rem;
        }
    }

    .handwritten-circled {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 40px;

        &:after {
            border: .25em solid $border-color-active;
            border-top: none;
            border-radius: 1.5em 1em 2em 1.5em;
            bottom: -.3em;
            content: '';
            left: -.3em;
            position: absolute;
            right: -.3em;
            top: -.1em;
        }
        &:before {
            border-top: .25em solid $border-color-active;
            border-radius: .5em;
            content: '';
            height: 1em;
            left: 0;
            position: absolute;
            top: -.3em;
            transform: rotate(-10deg);
            width: 2em;
        }
    }
}

@keyframes border-close {
    0% {
        width: 0;
        height: 0;
    }
    70% {
        width: 100%;
        height: 0;
    }
    100% {
        width: 100%;
        height: 60%;
    }
}
</style>