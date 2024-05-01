<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, nextTick, onUnmounted } from 'vue'
    import { Draggable, gsap } from 'gsap/all'
    import { supfnc } from '@/js/NSsupportFnc.js'

    const $el = ref(null);
    const props = defineProps({
        links: Array, // links:[{html:"", id:"", class:"", style:"", icon:"", href:"", blank:bool, events:{}}]
    });

    var { links } = toRefs(props);
    var btn = ref([]);
    var btnIcon = ref([]);
    var btnActive = ref([]);
    var btnTl = ref([]);

    var icon = ref($el.value.getElementsByClassName("webSocialIcon")[0]);
    var active = ref(1);

    var mountedF = () => {
        let btnTmp, tlTmp;
        for(let i in links.value){
            btnTmp = $el.value.getElementsByClassName(links.value[i].id)[0]
            btn.value.push(btnTmp);
            btnIcon.value.push(btnTmp.getElementsByTagName('i')[0]);
            btnActive.value.push(1);

            tl.value.fromTo([btnTmp, btnTmp], 1, {
                display: "none",
                width: 0
            }, {
                display: "block",
                width: "40px"
            });

            tlTmp = gsap.timeline();
            tlTmp.fromTo([btnTmp, btnTmp], 1, {
                width: "40px"
            }, {
                width: "180px"
            });
            btnTl.value.push(tlTmp);

            btnTmp.addEventListener('click', () => {
                if (btnActive.value[i] == 1) {
                    tlTmp.play();
                    btnActive.value[i] = 0;
                } else {
                    tlTmp.timeScale(2).reverse();
                    btnActive.value[i] = 1;
                }
            });
        }

        tl.value.fromTo([icon.value, icon.value], 1, {
            color: "#74b6e8"
        }, {
            color: "#3a7eb1"
        }, "-=1");

        tl.pause();

        icon.addEventListener('click', function() {
            if (active.value == 1) {
                tl.play();
                active.value = 0;
            } else {
                for(var i in btnTl.value) btnTl.value[i].reverse();
                tl.timeScale(2).reverse();
                active.value = 1;
                for(var i in btnActive.value) btnActive.value[i] = 1;
            }
        });
    }
    onMounted(mountedF);
</script>

<template>
    <div ref="$el">
        <ul class="webSocialList">
            <li v-for="link in links" :class="link.id + ' ' + link.class" :style="link.style">
                <i :class="link.icon"></i>
                <a :href="link.href" :target="link.blank?'_blank':''" v-html="link.html"></a>
            </li>

            <li class="webSocialIcon">
                <i class="fa fa-share-alt"></i>
            </li>
        </ul>
    </div>
</template>

<style scoped lang="scss">
    
</style>