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
        type: [Array, String, null], // 'txt' or ['txt', 'pdf']
        default: '*'
    }
});
const { title, accept } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "NSform.input.file";

// generate random id English characters
const id = ref(Array.from({length: 10}, () => Math.floor(Math.random() * 26 + 65).toString(36)).join(''));

const acceptType = computed(() => {
    if(accept.value === null) {
        return '*';
    } else if(Array.isArray(accept.value)) {
        return accept.value.map(item => item.startsWith('.') ? item : '.' + item).join(',');
    } else {
        return accept.value.startsWith('.') ? accept.value : '.' + accept.value;
    }
});
const previewIcon = computed(() => {
    const icons = [];
    for(const file of value.value){
        try{
            icons.push({
                src: getIconName(file), name: file.name
            });
        } catch(e) {
        }
    }
    return icons;
});

const getIconName = file => {
    const type = file.type.split('/')[1];
    switch(type){
        case 'pdf':
            return 'far fa-file-pdf';
        case 'txt':
            return 'far fa-file-alt';
        case 'doc':
        case 'docx':
            return 'far fa-file-word';
        case 'xls':
        case 'xlsx':
            return 'far fa-file-excel';
        case 'ppt':
        case 'pptx':
            return 'far fa-file-powerpoint';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'far fa-file-image';
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
            return 'far fa-file-video';
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'm4a':
            return 'far fa-file-audio';
        case 'zip':
        case 'rar':
        case '7z':
            return 'far fa-file-archive';
        default:
            return 'far fa-file';
    }
}

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
        <label :for="id" class="btn-crystal-sky">選擇檔案</label>
        <input :id="id" type="file" :accept="acceptType" multiple @change="uploadPreview($event.target.files)"/>
        <div v-if="previewIcon.length" class="preview-wrapper">
            <div class="preview" v-for="(preIcon, index) in previewIcon">
                <i :class="preIcon.src"></i>
                <span>{{preIcon.name}}</span>
                <i class="fas fa-trash-alt" @click="removeImage(index)"></i>
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
        width: 100%;
        height: 32px;
        display: flex;
        align-items: center;
        gap: .25rem;

        > span {
            display: block;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex-grow: 1;
        }

        > i:last-child {
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
}
</style>