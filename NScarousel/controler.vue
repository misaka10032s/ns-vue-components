<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

const props = defineProps({
});
const { } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NScarousel.controler";

const emit = defineEmits(["select"]);

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div class="left-controler" @click="emit('select', -1)">
        <i class="fas fa-chevron-left"></i>
    </div>
    <div class="right-controler" @click="emit('select', 1)">
        <i class="fas fa-chevron-right"></i>
    </div>
</template>

<style scoped lang="scss">
.left-controler, .right-controler{
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: white;
    
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    cursor: pointer;
}
.left-controler{
    left: 0;
}
.right-controler{
    right: 0;
}
</style>