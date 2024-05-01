<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, onUnmounted } from 'vue'
    import { tagchange } from '@/js/NSdirectives.js'

    const $el = ref(null);
    const props = defineProps({
        html: Object,
        options: Object,
    });
    const { html, options } = toRefs(props);

    const _options = options.value ?? {};
    const _defaultTag = _options.defaultTag ?? "div";
    const _inherit = _options.inherit ?? true;

    const _html = [];

    const lastTag = ref();
    const lastAttr = ref();
    const lastEvent = ref();
    const lastOptions = ref();

    const bindTag = (tag) => {
        tag = tag ?? lastTag.value ?? _defaultTag;
        if(_inherit) lastTag.value = tag;
        return tag;
    }

    const bindAttr = (attr) => {
        attr = attr ?? lastAttr.value;
        if(_inherit) lastAttr.value = attr;
        return attr;
    }

    const bindEvent = (obj) => {
        if(!Object.isDict(obj)) obj = {};

        obj = obj ?? lastEvent.value;
        for(var i in obj){
            if(typeof obj[i] != "function") delete obj[i];
        }

        if(_inherit) lastEvent.value = obj;
        return obj;
    }

    const bindOptions = (opt) => {
        if(!Object.isDict(opt)) opt = {};
        opt = opt ?? lastOptions.value;
        if(_inherit) lastOptions.value = opt;
        return opt;
    }

    

    onMounted(async () => {
        // console.log($el.value);
        [...($el.value ?? [])].forEach(e => e.dispatchEvent(new CustomEvent("mounted")));
    });

    watch(() => html.value, () => {
        while(_html.length) _html.pop();
        html.value.forEach(e => {
            _html.push({
                children: e.children,
                tag: bindTag(e.tag),
                attr: bindAttr(e.attr),
                event: bindEvent(e.event),
                options: bindOptions(e.options),
                text: e.text,
            })
        });
    }, {immediate: true});
</script>

<script>
export default {
    directives: {
        tagchange,
    }
}

export const html2json = (el) => {
    if(!(el instanceof HTMLElement || el instanceof Text)) return el;
    var data = {
        tag: el.nodeName,
        attr: [...el.attributes].reduce((a, e) => {a[e.localName] = el.getAttribute(e.localName); return a;}, {}),
        children: [...el.childNodes].reduce((a, e) => {
            a.push(html2json(e));
            return a;
        }, []),
        text: el instanceof Text ? el.data : null
    };

    return data;
}
</script>

<template>
    <component v-for="line in _html" :is="line.tag" v-bind="line.attr" v-on="line.event" ref="$el">
        <NSnestedJH v-if="line.children?.length" :html="line.children" :options="line.options"></NSnestedJH>
        <template v-else>{{ line.text }}</template>
    </component>
</template>