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

const emit = defineEmits(["input", "submit"]);

const props = defineProps({
    title: {
        type: [String, null],
        default: null
    },
    accept: {
        type: [Array, String, null], // 'jpeg' or ['jpeg', 'png']
        default: '*'
    }
});
const { title, accept } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.image";

// generate random id English characters
const id = ref(Array.from({length: 10}, () => Math.floor(Math.random() * 26 + 65).toString(36)).join(''));

const acceptType = computed(() => {
    if(accept.value === null) {
        return 'image/*';
    } else if(Array.isArray(accept.value)) {
        return accept.value.map(item => item.startsWith('image/') ? item : 'image/' + item).join(',');
    } else {
        return accept.value.startsWith('image/') ? accept.value : 'image/' + accept.value;
    }
});
const previewImage = computed(() => {
    const imgs = [];
    for(const img of value.value){
        try{
            imgs.push({src: URL.createObjectURL(img), name: img.name});
        } catch(e) {
        }
    }
    return imgs;
});
const value = ref([]);
const preValue = ref(value.value);

const select = () => {
    console.log(value.value);
    emit('input', value);
}

const uploadPreview = (files) => {
    console.log(files);
    [...files].forEach(file => {
        console.log(value.value.includes(file), value.value, file);
    });
    value.value.push(...files);
    select();
}

const removeImage = (index) => {
    value.value.splice(index, 1);
    select();
}

watch(() => value.value, (newval, oldval) => {
    if(newval === null) {
        value.value = preValue.value;
    } else {
        preValue.value = oldval;
    }
});

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});
</script>

<template>
    <div ref="$el">
        <label :for="id" class="btn-crystal-sky">選擇圖片</label>
        <input :id="id" type="file" :accept="acceptType" multiple @change="uploadPreview($event.target.files)"/>
        <div v-if="previewImage.length" class="preview-wrapper">
            <div class="preview" v-for="(preImg, index) in previewImage">
                <div class="preview-info">
                    <span>{{preImg.name}}</span>
                    <i class="fas fa-trash-alt" @click="removeImage(index)"></i>
                </div>
                <img :src="preImg.src"/>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.select-img-btn{
    padding: .25rem .5rem;
    border: 1px solid #ccc;
    background-color: transparent;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;

    &:hover {
        color: #fff;
        background-color: #22222270;
    }

    &:disabled {
        background-color: #cccccca0;
        color: #413838;
        cursor: not-allowed;
    }
}
input {
    display: none;
}
.preview-wrapper{
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    .preview{
        position: relative;

        .preview-info{
            display: flex;
            height: 24px;
            width: 100px;

            > span {
                display: block;
                flex-grow: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            > i {
                color: #00000070;
                padding: 3px;
                border-radius: 5px;
                cursor: pointer;
                transition: color 0.3s;

                &:hover {
                    color: #ff0000;
                }
            }
        }
    
        > img {
            height: 100px;
            width: 100px;
            object-fit: contain;
        }
    }
}
</style>