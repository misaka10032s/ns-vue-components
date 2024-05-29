<!-- ref https://codepen.io/leochiu-a/pen/mdYyWEW -->
<script setup>
import { useI18n } from 'vue-i18n'
import store from '@/store/serverStore.js'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

const $el = ref(null);

const props = defineProps({
});
const { } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "trans.display";

const showSequence = ["#default", "#incoming-call", "#phone-call"];

function transition() {
    document.startViewTransition(() => {
        const showedIndex = showSequence.findIndex((id) => {
            const { display } = window.getComputedStyle(document.querySelector(id));
            return display === "block";
        });

        // hide current element
        const showedElement = document.querySelector(showSequence[showedIndex]);
        showedElement.style.display = "none";

        // show next element
        const index = showedIndex === showSequence.length - 1 ? 0 : showedIndex + 1;
        const toShowElement = document.querySelector(showSequence[index]);
        toShowElement.style.display = "block";
    });
}


onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div ref="$el">
        <button class="btn mx-2 nav-baseline-sky" @click="transition">transition</button>
        <div id="default">
            <div class="dynamic-island">
                <div class="dynamic-island__inner">
                    <div class="dynamic-island__camera">
                        <img class="island__lens" src="https://assets.codepen.io/605876/lens.png" alt="" />
                    </div>
                </div>
            </div>
        </div>
    
        <div id="phone-call">
            <div class="dynamic-island">
                <div class="dynamic-island__extra-start phone">
                    <div class="phone__icon">
                        <span class="material-icons">
                            call
                        </span>
                    </div>
                    <div class="phone__time">12:12</div>
                </div>
    
                <div class="dynamic-island__inner">
                    <div class="dynamic-island__camera">
                        <img class="island__lens" src="https://assets.codepen.io/605876/lens.png" alt="" />
                    </div>
                </div>
                <div class="dynamic-island__extra-end phone-signal">
                    <img src="https://firebasestorage.googleapis.com/v0/b/codepen-1516b.appspot.com/o/phone%20signal.png?alt=media" alt="">
                </div>
            </div>
        </div>
    
        <div id="incoming-call">
            <div class="dynamic-island">
                <div class="dynamic-island__extra-start who">
                    <div class="who__avatar">
                        <img src="https://firebasestorage.googleapis.com/v0/b/codepen-1516b.appspot.com/o/notion-style-avatar.png?alt=media" alt="">
                    </div>
                    <div class="who__mobile">mobile</div>
                    <div class="who__name">David</div>
                </div>
                <div class="dynamic-island__inner">
                    <div class="dynamic-island__camera">
                        <img class="island__lens" src="https://assets.codepen.io/605876/lens.png" alt="" />
                    </div>
                </div>
                <div class="dynamic-island__extra-end actions">
                    <div class="actions__icon actions__call-end">
                        <span class="material-icons">
                            call_end
                        </span>
                    </div>
                    <div class="actions__icon actions__call-start">
                        <span class="material-icons">
                            call
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
* {
    box-sizing: border-box;
}

body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #dde6ed;
}

/* default */

.dynamic-island {
    background: black;
    border-radius: 50px;
    transition: all 0.5s;
    position: relative;
    display: flex;
    align-items: center;
    padding: 4px 8px;
    width: fit-content;
}

.dynamic-island__inner {
    min-width: 100px;
    height: 100%;
    display: flex;
    justify-content: end;
    align-items: center;
}

.dynamic-island__camera {
    width: 12px;
    height: 12px;
    display: flex;
}

.dynamic-island__camera img {
    width: 100%;
    height: 100%;
}

/* phone-call */

.phone {
    display: flex;
}

.phone__icon {
    display: flex;
    align-items: center;
}

.phone__icon span {
    color: #6df66e;
    font-size: 16px;
}

.phone__time {
    color: #6df66e;
    font-size: 14px;
    margin-left: 4px;
}

.phone-signal {
    display: flex;
    margin-left: 15px;
    height: 16px;
    width: 38px;
}

/* incoming call */

.who {
    width: 99px;
    margin-block: 8px;
    margin-left: 4px;
    display: grid;
    grid-template-rows: repeat(2, auto);
    grid-template-columns: repeat(2, auto);
    column-gap: 8px;
}

.who__avatar {
    height: 50px;
    width: 50px;
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    grid-row: 1 / -1;
    grid-column: 1 / 2;
}

.who__avatar img {
    height: 100%;
    width: 100%;
}

.who__mobile {
    color: #999999;
    font-size: 12px;
    line-height: 1;
    align-self: end;
}

.who__name {
    color: white;
}

.actions {
    display: flex;
    gap: 8px;
    margin-inline: 12px 4px;
}

.actions__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: white;
    display: grid;
    place-items: center;
}

.actions__call-start {
    background-color: #57d76a;
}

.actions__call-end {
    background-color: #f35242;
}

/* View Transition */

#phone-call,
#incoming-call {
    display: none;
}

.dynamic-island {
    view-transition-name: dynamic-island;
}

::view-transition-old(dynamic-island),
::view-transition-new(dynamic-island) {
    height: 100%;
}

.dynamic-island__camera {
    view-transition-name: camera;
}

.dynamic-island__extra-start {
    view-transition-name: extra-start;
}

.dynamic-island__extra-end {
    view-transition-name: extra-end;
}

@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

::view-transition-new(extra-start),
::view-transition-new(extra-end) {
    animation: fade-in 0.5s both;
    animation-delay: 0.5s;
}
</style>