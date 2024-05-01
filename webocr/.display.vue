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

    import Tesseract from 'tesseract.js';
    import { createWorker } from 'tesseract.js';

    const $el = ref(null);

    const props = defineProps({
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "NSwebocr.display";

    // https://www.npmjs.com/package/tesseract.js/v/2.1.1
    const imageUrl = ref("/system/test/equipment1.png");
    const langList = {
        "chi_tra": "繁體中文",
        "chi_sim": "简体中文",
        "eng": "English",
    };

    const lang = ref("chi_tra");
    const inputImage = ref(null);
    const result = ref(null);

    const method1 = () => {

        Tesseract
        .recognize(previewImage.value, lang.value, { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
            console.log("method1", lang.value, text);
            result.value = text;
        })
        .catch((error) => {
            console.log(error.message)
        });
    }

    const method2 = () => {
        const worker = createWorker({
            logger: m => console.log(m)
        });
        (async () => {
            await worker.load();
            await worker.loadLanguage(lang.value);
            await worker.initialize(lang.value);
            const { data: { text } } = await worker.recognize(previewImage.value);
            console.log("method2", lang.value, text);
            result.value = text;
            await worker.terminate();
        })();
    }

    const previewImage = computed(() => {
        if (inputImage.value) {
            return URL.createObjectURL(inputImage.value);
        }
        return null;
    });

    const pasteImageFromClipboard = (e) => {
        navigator.clipboard.read().then(clipboardItems => {
            clipboardItems.forEach(clipboardItem => {
                clipboardItem.types.forEach(type => {
                    // console.log(type);
                    if (type === 'image/png') {
                        clipboardItem.getType(type).then(blob => {
                            inputImage.value = blob;
                        });
                    }
                });
            });
        });
    }

    onMounted(async () => {
        console.log(`@${i18nRoute}`);

        // method1();
        // method2();
    });
</script>

<template>
    <div ref="$el">
        <select v-model="lang">
            <option v-for="(value, key) in langList" :key="key" :value="key">{{ value }}</option>
        </select>
        <!-- <img :src="imageUrl" alt="image" /> -->
        <div class="paste-image">
            <input @keydown.ctrl.v="pasteImageFromClipboard" @paste="pasteImageFromClipboard" />
            <input type="file" @change="inputImage = $event.target.files[0]" />
            <!-- preview -->
            <img v-if="inputImage" :src="previewImage" alt="image" />
        </div>
        <button @click="method1()">method1</button>
        <button @click="method2()">method2</button>
        <!-- resize x y -->
        <textarea style="resize: both; width: 100%; height: 200px;">{{ result }}</textarea>
    </div>
</template>

<style scoped lang="scss">
</style>