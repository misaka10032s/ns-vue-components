<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

import item from './item.vue'
import controler from './controler.vue'
import indicator from './indicator.vue'

const $el = ref(null);

const props = defineProps({
    config: {
        type: Object,
        default: () => {
            return {
                autoPlay: true,
                delay: 5000,
            }
        }
    }
});
const { config } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NScarousel";

const data = computed(() => config.value.data || []);

const direction = ref('fade-left'); // 0: left, 1: right
const selected = ref(0);
const select = v => {
    const l = data.value.length;
    const newValue = (v + l) % l;
    direction.value = newValue > selected.value ? 'fade-left' : 'fade-right';
    selected.value = newValue;
    console.log(selected.value);
};

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div ref="$el" class="carousel-wrapper">
        <div class="items-wrapper">
            <item v-for="d in data" :key="d.id" :data="d" :selected="selected"/>
        </div>
        <controler @select="v => select(selected + v)"/>
        <indicator @select="v => select(v)" :length="data.length" :selected="selected"/>
    </div>
</template>

<style scoped lang="scss">
.items-wrapper{
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.5s;
    min-height: 120px;
}

.carousel-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid black;
}
</style>