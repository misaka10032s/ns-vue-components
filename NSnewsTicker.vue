<script setup>
    import { ref, toRefs, onMounted, onUnmounted } from 'vue'
    import { gsap } from 'gsap/all'

    const $el = ref(null);

    const props = defineProps({
        item: Array
    });
    const { item } = toRefs(props);

    // newsBarItem: [{id:"required", class: "", style: "", html: "required", duration: unit ms, enter: {from: {}, to: {}}, leave: {from: {}, to: {}}, events: {}}, ...]
    // from { style1: "", x: 123, ...}
    // events: {click: function(event, itemIdx){}}

    var newsBarItem = ref(item.value);
    var newsBarIdx = ref(0);
    var newsBarHover = ref(0);
    var newsBarTimeCounter = ref(0);
    var newsBarInterval = ref(0);
    var updateTime = ref(0);

    var newsBarTrans = function(){
        var befIdx, aftIdx; 
        befIdx = newsBarIdx.value;
        aftIdx = (newsBarIdx.value + 1) % newsBarItem.value.length;
        newsBarTimeCounter.value = 0;
        newsBarIdx.value = aftIdx;
        
        gsap.fromTo(document.getElementById(newsBarItem.value[befIdx].id), newsBarItem.value.animeDuration || 1, newsBarItem.value[befIdx].leave?.from || {opacity: 1, transform: "matrix(1, 0, 0, 1, 0, 0) rotateX(0deg) translateX(-50%)"}, newsBarItem.value[befIdx].leave?.to || {opacity: 0, transform: "matrix(1, 0, 0, 1, 0, -20) rotateX(90deg) translateX(-50%)"});
        gsap.fromTo(document.getElementById(newsBarItem.value[aftIdx].id), newsBarItem.value.animeDuration || 1, newsBarItem.value[aftIdx].enter?.from || {opacity: 0, transform: "matrix(1, 0, 0, 1, 0, 20) rotateX(-90deg) translateX(-50%)"}, newsBarItem.value[befIdx].enter?.to || {opacity: 1, transform: "matrix(1, 0, 0, 1, 0, 0) rotateX(0deg) translateX(-50%)"});
    }

    var bindSpecialEventListener = function(){
        var items, chr, fncName, events;
        items = [...$el.value.children];
        for(let i in items){ // loop titleSpecial column in all row
            chr = [...items[i].getElementsByTagName('*')||[]];
            for(let c in chr){ // loop titleSpecial column all children (next floor only)
                events = chr[c].getAttributeNames().reduce((a,e)=>{if(e[0]=='@')a.push(e); return a;}, []);
                for(let fncIdx in events){
                    fncName = chr[c].getAttribute(events[fncIdx]);
                    if(typeof items[i].events[fncName] != "function") continue;
                    chr[c].addEventListener(events[fncIdx].slice(1), (e)=>{
                        items[i].events[fncName](e, i);
                    });
                    chr[c].removeAttribute(events[fncIdx]);
                }
            }
        }
    };


    onMounted(async ()=>{
        bindSpecialEventListener();
        newsBarInterval.value = setInterval(() => {
            if(!newsBarHover.value) {
                newsBarTimeCounter.value += Date.now() - updateTime.value;
            }
            if(newsBarTimeCounter.value > (newsBarItem.value[newsBarIdx.value].duration || 1000) + (newsBarItem.value.animeDuration || 1000)){
                newsBarTrans();
            }
            updateTime.value = Date.now();
        }, 10);
    });

    onUnmounted(()=>{
        clearInterval(newsBarInterval.value);
    });
</script>

<script>
</script>

<template>
    <div ref="$el" class="newsBar" @mouseenter="newsBarHover=1" @mouseleave="newsBarHover=0">
        <div v-for="item in newsBarItem" :id="item.id" :class="item.class" :style="item.style" v-html="item.html">
        </div>
    </div>
</template>

<style scoped lang="scss">
    .newsBar > div{
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }
</style>