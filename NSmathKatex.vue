<script setup>
import { ref, toRefs, onMounted, watch } from 'vue'
import katex from 'katex'

const $el = ref(null);

const props = defineProps({
    v: String,
    d: String,
    m: String,
});
const { v, d, m } = toRefs(props);

const setMath = () => {
    var _v = '{' + v.value + '}';
    var _d = d.value == 'f' ? false : true;
    if(_d==false && m.value != 'f'){
        $el.value.style = document.createElement('span').style;
        $el.value.style.display = "inline-block";
        $el.value.style.margin = "8px 5px;";
    }
    katex.render(_v,  $el.value , {"displayMode":_d,"leqno":false,"fleqn":false,"throwOnError":false,"errorColor":"#cc0000","strict":"ignore","trust":false,"macros":{"\\if":"f^{-1}(#1)","\\df":"f'(#1)","\\f":"f(#1)","\\ig":"g^{-1}(#1)","\\dg":"g'(#1)","\\g":"g(#1)","\\h":"h(#1)","\\sech":"\\text{sech}","\\csch":"\\text{csch}"}});
}

onMounted(async () => {
    setMath();
});

watch(() => v.value, setMath);
</script>

<template>
    <div ref="$el">
    </div>
</template>

<style scoped lang="scss">
</style>

<style lang="scss">
.katex-html{
    display: none;
}
</style>