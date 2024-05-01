<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, onUnmounted } from 'vue'

    const $el = ref(null);
    const props = defineProps({
        router: Object,
        btns: Array,
        goto: String,
        level: Number,
    });
    const { btns, router, goto, level } = toRefs(props);
    const toggleClass = (el) => {
        if(el.tagName == "I") el = el.parentElement;
        el.classList.contains("collapsed") ? 
        // https://jsfiddle.net/ann7tctp/
        (el.children[0].classList.remove("rotate-2")):
        (el.children[0].classList.add("rotate-2"));
    }
    const _level = Math.max(level.value || 0, 0);
</script>

<template>
    <div ref="$el" class="list-group" :style="'padding-left:' + (1.25 * _level) + 'rem'">
        <template v-for="btn in btns">
            <template v-if="btn.children?.length">
                <a :href="`#${ goto }${ btn.id }`.replace(/\//g, '')" class="list-group-item" data-bs-toggle="collapse" @click="toggleClass($event.target)">
                    <i class="fas fa-chevron-right me-2 smooth-2"></i> {{ btn.name }}
                </a>
                <NStreeFolder :id="`${ goto }${ btn.id }`.replace(/\//g, '')" class="collapse" :router="router" :btns="btn.children" :goto="`${ goto }/${ btn.id }`" :level="_level+1"></NStreeFolder>
            </template>
            <router-link v-else-if="btn.id" custom :to="`${ goto }/${ btn.id }`" v-slot="{ navigate, isActive, route }">
                <span class="list-group-item" :class="{'selectedPage': isActive}" role="button" @click="navigate">{{ btn.name }}</span>
            </router-link>
            <div v-else class="list-group-item">{{ btn.name }}</div>
        </template>
    </div>
</template>