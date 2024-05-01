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

const props = defineProps({
    id: {
        type: String,
        // default random id
        default: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    },
    ontext: {
        type: String,
        default: "ON"
    },
    offtext: {
        type: String,
        default: "OFF"
    },
    onColor: {
        type: String,
        default: "#02C66F"
    },
    offColor: {
        type: String,
        default: "#FF3A19"
    },
    initstate: {
        type: Number,
        default: 0
    },
});
const { id, ontext, offtext, onColor, offColor, initstate } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "unit.flipToggle";

const emit = defineEmits(["toggle"]);

const state = ref(!!initstate.value);
const toggleState = () => {
    state.value ^= 1;
    emit("toggle", state);
};

const colors = computed(() => {
    return {
        "--onColor": onColor.value,
        "--offColor": offColor.value,
    };
});

watch(() => state.value, (newVal, oldVal) => {
    $el.value.querySelector("input").checked = !!newVal;
});

onMounted(async () => {
    console.log(`@${i18nRoute}`);

    if(state.value) {
        $el.value.querySelector("input").checked = true;
    }
});
</script>

<template>
    <div ref="$el">
        <input class="tgl tgl-flip" :id="id" type="checkbox" @click="toggleState()"/>
        <label class="tgl-btn" :data-tg-off="offtext" :data-tg-on="ontext" :for="id" :style="colors"></label>
    </div>
</template>

<style lang="scss"></style>

<style scoped lang="scss">
.tgl {
    display: none;

    // add default box-sizing for this scope
    &,
    &:after,
    &:before,
    & *,
    & *:after,
    & *:before,
    &+.tgl-btn {
        box-sizing: border-box;

        &::selection {
            background: none;
        }
    }

    +.tgl-btn {
        outline: 0;
        display: block;
        width: 4em;
        height: 2em;
        position: relative;
        cursor: pointer;
        user-select: none;

        &:after,
        &:before {
            position: relative;
            display: block;
            content: "";
            width: 50%;
            height: 100%;
        }

        &:after {
            left: 0;
        }

        &:before {
            display: none;
        }
    }

    &:checked+.tgl-btn:after {
        left: 50%;
    }
}
.tgl-flip {
    +.tgl-btn {
        padding: 2px;
        transition: all .2s ease;
        font-family: sans-serif;
        perspective: 100px;

        &:after,
        &:before {
            display: inline-block;
            transition: all .4s ease;
            width: 100%;
            text-align: center;
            position: absolute;
            line-height: 2em;
            font-weight: bold;
            color: #fff;
            position: absolute;
            top: 0;
            left: 0;
            backface-visibility: hidden;
            border-radius: 4px;
        }

        &:after {
            content: attr(data-tg-on);
            background: var(--onColor);
            transform: rotateY(-180deg);
        }

        &:before {
            background: var(--offColor);
            content: attr(data-tg-off);
        }

        &:active:before {
            transform: rotateY(-20deg);
        }
    }

    &:checked+.tgl-btn {
        &:before {
            transform: rotateY(180deg);
        }

        &:after {
            transform: rotateY(0);
            left: 0;
            background: #7FC6A6;
        }

        &:active:after {
            transform: rotateY(20deg);
        }
    }
}
</style>