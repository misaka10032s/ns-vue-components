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

const emit = defineEmits(["select"]);

const props = defineProps({
    length: {
        type: Number,
        default: 0
    },
    selected: {
        type: Number,
        default: 0
    }
});
const { length, selected } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NScarousel.indicator";

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div ref="$el" class="indicator-wrapper">
        <div class="indicator" v-for="i in length">
            <i class="fas fa-circle" :class="{'active': selected==i-1}" @click="emit('select', i-1)"></i>
        </div>
    </div>
</template>

<style scoped lang="scss">
.indicator-wrapper{
    position: absolute;
    bottom: min(5%, 50px);
    left: 50%;
    transform: translateX(-50%);
    gap: 10px;
    display: flex;

    .indicator{
        cursor: pointer;
    }
}
.active{
    color: red;
}
</style>