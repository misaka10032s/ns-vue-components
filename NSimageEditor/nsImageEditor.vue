<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { url_for } from '@/router/routerSetting.js'
import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
import { gsap, Draggable } from 'gsap/all'

import { supfnc } from '@/js/NSsupportFnc.js'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import Swal from 'sweetalert2'

import html2canvas from 'html2canvas';

const $el = ref(null);
const $canvas = ref(null);

const props = defineProps({
});
const { config } = toRefs(props);
const { t, locale } = useI18n();
const [route, router] = [useRoute(), useRouter()];

const i18nRoute = "nsImageEditor";

const updateCounter = ref(0);
const width = computed(() => Math.max(...Array.from(images.value, (image) => image.x + image.width)) || updateCounter.value);
const height = computed(() => Math.max(...Array.from(images.value, (image) => image.y + image.height)) || updateCounter.value);
const aRow = computed(() => Math.ceil(Math.sqrt(images.value.length)));

const images = ref([]);

const fixSize = ref({
    enable: true,
    width: 80,
    height: 100,
    gap: 0,
});

const edit = (image) => {
    console.log('edit', image);
};

const remove = (image) => {
    images.value = images.value.filter((img) => img.id !== image.id);
    updateImage();
};

const resizeImage = (imgObj, maxWidth, maxHeight) => {
    const width = imgObj.width;
    const height = imgObj.height;
    const radio = Math.max(Math.min(width / maxWidth, height / maxHeight), 1);

    const canvas = document.createElement("canvas");
    canvas.width = width / radio;
    canvas.height = height / radio;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

    return canvas;
};

const uploadImage = (e) => {
    const files = e.target.files;
    let counter = 0;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // const reader = new FileReader();
        
        const newImage = {
            id: Math.random().toString(36) + i,
            src: null,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
        };
        images.value.push(newImage);

        // turn file into blob
        const imageBlob = new Blob([file], {type: file.type});
        newImage.src = URL.createObjectURL(imageBlob);

        // get image size
        const imgObj = new Image();
        imgObj.src = newImage.src;
        imgObj.onload = () => {
            if(fixSize.value.enable){
                newImage.width = fixSize.value.width || imgObj.width;
                newImage.height = fixSize.value.height || imgObj.height;
            }
            else {
                newImage.width = imgObj.width;
                newImage.height = imgObj.height;
            }
            console.log('imgObj', fixSize.value, newImage, imgObj.width, imgObj.height);

            counter++;

            const resizedImgObj = resizeImage(imgObj, 600, 800);
            newImage.src = resizedImgObj.toDataURL("image/png");

            if(counter == files.length) setTimeout(() => updateImage(), 10);
        };
    }
};

const saveImage = () => {
    // make div.edit-canvas to an image
    html2canvas($el.value.querySelector(".edit-canvas")).then((canvas) => {
        // resize canvas
        $canvas.value.width = canvas.width;
        $canvas.value.height = canvas.height;
        const ctx = $canvas.value.getContext("2d");
        ctx.drawImage(canvas, 0, 0);

        const a = document.createElement("a");
        a.href = $canvas.value.toDataURL("image/png");
        a.download = "image.png";
        a.click();
    });
};

const clearImage = () => {
    images.value = [];
    updateCounter.value++;
};

const addImageToCanvas = (image, x, y) => {
    const img = new Image();
    img.src = image.src;
    img.onload = () => {
        const ctx = $canvas.value.getContext("2d");
        ctx.drawImage(img, x, y, img.width, img.height);
    };
};

const pasteImageFromClipBoard = () => {
        // get the last copied image from clipboard
        navigator.clipboard.read().then(clipboardItems => {
            clipboardItems.forEach(clipboardItem => {
                clipboardItem.types.forEach(type => {
                    // console.log(type);
                    if (type === 'image/png') {
                        clipboardItem.getType(type).then(blob => {
                            uploadImage({target: {files: [blob]}});
                        });
                    }
                });
            });
        });
    }

const fixImageSize = () => {
    if(fixSize.value.enable){
        images.value.forEach((image, index) => {
            image.width = fixSize.value.width;
            image.height = fixSize.value.height;
        });
    } else {
        images.value.forEach((image, index) => {
            const imgObj = new Image();
            imgObj.src = image.src;
            imgObj.onload = () => {
                image.width = imgObj.width;
                image.height = imgObj.height;
            };
        });
    }
};

const fixImagePosition = () => {
    // [sqrt(n)]
    images.value.forEach((image, index) => {
        const row = Math.floor(index / aRow.value);
        image.x = (index % aRow.value) * (image.width + fixSize.value.gap);
        image.y = row * (image.height + fixSize.value.gap);
    });
};

const updateImage = () => {
    fixImageSize();
    fixImagePosition();
    updateCounter.value++;
    console.log('updateImage', images.value, width.value, height.value);
};

onMounted(async () => {
    console.log(`@${i18nRoute}`);
});

watch(() => fixSize.value, () => {
    updateImage();
}, {deep: true});
</script>

<template>
    <div ref="$el" class="edit-wrapper">
        <canvas ref="$canvas" class="output-canvas"></canvas>
        <div class="display-block">
            <div class="edit-canvas" :style="{width: `${width}px`, height: `${height}px`}">
                <div v-for="image in images" :key="image.id" :style="{width: `${image.width}px`, height: `${image.height}px`, left: `${image.x}px`, top: `${image.y}px`, maxWidth: `100%`}">
                    <img :src="image.src" alt="image" />
                </div>
            </div>
        </div>
        <div class="menu">
            <div class="edit-tools">
                <div>
                    <input id="fixSize" type="checkbox" v-model="fixSize.enable" />
                    <label for="fixSize">Fix Size</label>
                </div>
                <div>
                    <p>Width</p>
                    <input type="number" v-model="fixSize.width" :disabled="!fixSize.enable" />
                </div>
                <div>
                    <p>Height</p>
                    <input type="number" v-model="fixSize.height" :disabled="!fixSize.enable" />
                </div>
                <div>
                    <p>Gap</p>
                    <input type="number" v-model="fixSize.gap" :disabled="!fixSize.enable" />
                </div>
                <div>
                    <input class="w-100" @keydown.ctrl.v="pasteImageFromClipBoard()" placeholder="paste from clipboard" />
                </div>
            </div>
            <div class="edit-tools">
                <label class="btn btn-primary" for="addImage">Add Image</label>
                <input id="addImage" type="file" accept="image/*" style="display: none" multiple @change="uploadImage" />
                <button class="btn btn-primary" @click="saveImage">Save Image</button>
                <button class="btn btn-primary" @click="clearImage">Clear</button>
            </div>
            <div class="edit-images">
                <div class="edit-image" v-for="image in images" :key="image.id">
                    <div>
                        <img :src="image.src" alt="image" />
                    </div>
                    <div>
                        <button class="btn" @click="edit(image)"><i class="fas fa-edit"></i></button>
                        <button class="btn" @click="remove(image)"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.edit-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;

    .output-canvas {
        display: none;
    }

    .display-block{
        flex-grow: 1;
        max-width: 70%;
        .edit-canvas {
            position: relative;
            border: 1px solid #000;
            max-width: 100%;
            box-sizing: content-box;
    
            div {
                position: absolute;
            }
    
            img {
                width: 100%;
                height: 100%;
                object-fit: fill;
            }
        }
    }

    .menu {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: min(30%, 300px);

        .edit-tools {
            display: flex;
            flex-wrap: wrap;
            gap: .5rem;

            div {
                width: 100%;
                display: flex;
                gap: .5rem;

                p {
                    flex-grow: 1;
                    margin: 0;
                }
                input {
                    width: 100px;
                }
            }
        }

        .edit-images {
            display: flex;
            flex-direction: column;
            gap: .5rem;

            .edit-image {
                display: flex;
                gap: 10px;

                img {
                    width: 100px;
                    height: 100px;
                    object-fit: contain;
                }
            }
        }
    }
}
</style>