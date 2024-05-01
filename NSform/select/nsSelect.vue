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
const $menu = ref(null);

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
    defaultText: {
        type: String,
        default: '請選擇一個選項'
    },
});
const { title, options, defaultText } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.select.nsSelect";

// generate random id English characters
const id = ref(Array.from({length: 10}, () => Math.floor(Math.random() * 26 + 65).toString(36)).join(''));
const toogleMenu = () => {
    collapse.value ^= true;
}

const searchText = ref('');
const collapse = ref(true);
const optionsFiltered = computed(() => {
    return options.value.reduce((acc, item) => {
        if(item.name) {
            const filtered = item.options.filter(option => option.label.includes(searchText.value));
            if(filtered.length) {
                acc.push({
                    name: item.name,
                    options: filtered
                });
            }
        } else {
            if(item.label.includes(searchText.value)) {
                acc.push(item);
            }
        }
        return acc;
    }, []);
});
const selected = computed(() => {
    return options.value.flatMap(
        item => item.options || item
    ).find(option => option.value === value.value)?.label || defaultText.value;
});
const value = ref('');
const preValue = ref(value.value);

const close = $event => {
    // if click outside the menu, collapse
    let relatedTarget = $event.relatedTarget;
    while(relatedTarget) {
        if(relatedTarget === $el.value) {
            return;
        }
        relatedTarget = relatedTarget.parentElement;
    }
    if($event.relatedTarget !== $el.value) {
        collapse.value = true;
    }
}

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

watch(() => collapse.value, (newval) => {
    if(!newval) {
        // $menu.value.style.transform = '';
        nextTick(() => {
            $menu.value.focus();
            
            // set window not overflow
            // const rect = $menu.value.getBoundingClientRect();
            // const 
            //     overflowTop = rect.top,
            //     overflowLeft = rect.left,
            //     overflowBottom = rect.bottom - window.innerHeight,
            //     overflowRight = rect.right - window.innerWidth;
            // console.log(rect, overflowTop, overflowLeft, overflowBottom, overflowRight);
            // // if overflow, move the menu
            // const dx = overflowLeft > 0 ? (overflowRight > 0 ? -overflowRight : 0) : -overflowLeft;
            // const dy = overflowTop > 0 ? (overflowBottom > 0 ? -overflowBottom : 0) :-overflowTop;

            // $menu.value.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        gsap.killTweensOf($el.value);
        gsap.to($el.value, {
            zIndex: 10000,
            duration: 0.01,
            ease: 'power2.out'
        });
    } else {
        gsap.killTweensOf($el.value);
        gsap.to($el.value, {
            zIndex: 0,
            duration: 1,
            ease: 'power2.out'
        });
    }
});

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div ref="$el" class="ns-dropdown-wrapper" tabindex="9999" @blur="close($event)">
        <p class="ns-selected" @click="toogleMenu">{{ selected }}</p>
        <transition name="fade">
            <div ref="$menu" class="ns-dropdown-menu" v-if="!collapse">
                <div class="bridge"></div>
                <!-- <label class="ns-form-check" :for="id">
                    <input class="ns-form-check-input" type="radio" :id="id" :value="null" v-model="value" @change="change">
                    <span>{{ defaultText }}</span>
                </label> -->
                <div class="search">
                    <input type="text" v-model="searchText" @blur="1||close($event)" placeholder="search..."/>
                </div>
                
                <div class="options-wrapper">
                    <template v-for="item in optionsFiltered">
                        <!-- if contains name, use group -->
                        <div v-if="item.name" class="ns-form-check-group">
                            <h4>{{ item.name }}</h4>
                            <label v-for="option in item.options" class="ns-form-check" :class="{'active': value==option.value}" :for="option.label + id">
                                
                                <input class="ns-form-check-input" type="radio" :id="option.label + id" :value="option.value" v-model="value" @change="change" >
                                <span>{{ option.label }}</span>
                            </label>
                        </div>
                        <!-- if not contains name, use single -->
                        <label v-else class="ns-form-check" :class="{'active': value==item.value}" :for="item.label + id">
                            <input class="ns-form-check-input" type="radio" :id="item.label + id" :value="item.value" v-model="value" @change="change">
                            <span>{{ item.label }}</span>
                        </label>
                    </template>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped lang="scss">
.fade-enter-active, .fade-leave-active {
    transition: all 0.4s;
}
.fade-enter-active {
    opacity: 1;
    top: calc(100% + 20px);
}
.fade-leave-active {
    opacity: 0;
    top: 0;
}
svg {
    display: none;
}

.ns-dropdown-wrapper {
    position: relative;
    filter: url(#goo);

    &:focus-visible {
        outline: none;
    }

    .ns-selected {
        padding: 0.5rem .75rem;
        border: none;
        border-radius: 1rem;
        text-overflow: ellipsis;
        background-color: #fff;
        cursor: pointer;
    }

    .ns-dropdown-menu {
        position: absolute;
        top: calc(100% + 20px);
        left: 0;
        width: 100%;
        padding: 0.5rem;
        border: none;
        border-radius: 1rem;
        background-color: #fff;
        transition: all 0.4s cubic-bezier(0.93, 0.88, 0.1, 0.8);
        .bridge {
            position: absolute;
            top: -20px;
            left: 20%;
            width: 24px;
            height: 20px;
            background-color: #fff;
        }
        .search {
            width: 100%;
            padding: 0.5rem;
    
            input {
                width: 100%;
                padding: .25rem .5rem;
                border: none;
                border-radius: 0.5rem;
    
                &:placeholder {
                    color: #aaa;
                }
                
                &:focus-visible {
                    outline: none;
                }
            }
        }

        .options-wrapper {
            max-height: 10rem;
            overflow: auto;

            &::-webkit-scrollbar{
                width: 6px;
            }
            &::-webkit-scrollbar-thumb {
                border-radius: 3px;
                background: #00000040;
            }
        }

        .ns-form-check {
            padding: .25rem .5rem;
            margin: 0 .25rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s;

            &:last-child {
                border-bottom: none;
            }

            &.active {
                background-color: #ddd;
            }

            .ns-form-check-inline {
                display: inline-block;
                margin-right: 1rem;
            }

            .ns-form-check-input {
                display: none;
            }
        }
    }
}
</style>