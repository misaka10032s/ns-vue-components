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

    import nsColor from './input/nsColor.vue'
    import nsDate from './input/nsDate.vue'
    import nsEmail from './input/nsEmail.vue'
    import nsFile from './input/nsFile.vue'
    import nsImage from './input/nsImage.vue'
    import nsNumber from './input/nsNumber.vue'
    import nsPassword from './input/nsPassword.vue'
    import nsText from './input/nsText.vue'

    import nsCheckbox from './select/nsCheckbox.vue'
    import nsDropdown from './select/nsDropdown.vue'
    import nsRadio from './select/nsRadio.vue'
    import nsSelect from './select/nsSelect.vue'
    import nsSlider from './select/nsSlider.vue'

    const $el = ref(null);

    const props = defineProps({
    });
    const { } = toRefs(props);
    const { t, locale } = useI18n();
    const [route, router] = [useRoute(), useRouter()];

    const i18nRoute = "NSform.display";

    const options = [
        { label: "蘋果", value: "apple" },
        { label: "香蕉", value: "banana" },
        { label: "橘子", value: "orange" },
    ];

    const groupOptions = [
        {
            name: "主食",
            options: [
                { label: "白飯", value: "rice" },
                { label: "麵包", value: "bread" },
                { label: "麵條", value: "noodle" },
                { label: "餅乾", value: "cookie"},
                { label: "蛋糕", value: "cake"},
                { label: "牛排", value: "steak"},
                { label: "炒麵", value: "fried noodle"},
                { label: "某個很長的名字的食物", value: "very long name food"},
            ]
        },
        {
            name: "蔬菜",
            options: [
                { label: "青椒", value: "green pepper" },
                { label: "紅蘿蔔", value: "carrot" },
                { label: "番茄", value: "tomato" },
            ]
        },
        { label: "點心", value: "snack"},
    ];

    const sliderLabel = [0, {10: "小"}, 20, {30: "中"}, 40, {50: "大"}, 60, {70: "特大"}, 80, 90, 100]

    const comfirmChange = async (x) => {
        Swal.fire({
            title: x.value ? "ON" : "OFF",
            text: x.value,
            showCancelButton: true,
            confirmButtonText: "OK",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("confirmed");
            } else {
                x.value = null;
            }
        });
    };

    const change = async (x) => {
        console.log(x);
    };

    onMounted(async () => {
        console.log(`@${i18nRoute}`);
    });
</script>

<template>
    <div ref="$el">
        <div class="wrapper">
            <h4>Input</h4>
            <div class="block">
                <p>color</p>
                <ns-color @input="v => change(v)" @submit="v => comfirmChange(v)"/>
            </div>
            <div class="block">
                <p>date</p>
                <ns-date @input="v => change(v)" @submit="v => comfirmChange(v)"/>
            </div>
            <div class="block">
                <p>email</p>
                <ns-email @input="v => change(v)" @submit="v => comfirmChange(v)"/>
            </div>
            <div class="block">
                <p>file</p>
                <ns-file @input="v => change(v)" @submit="v => comfirmChange(v)"/>
            </div>
            <div class="block">
                <p>image</p>
                <ns-image @input="v => change(v)" @submit="v => comfirmChange(v)"/>
            </div>
            <div class="block">
                <p>number</p>
                <ns-number @input="v => change(v)" @submit="v => comfirmChange(v)" :min="-5" :max="88"/>
            </div>
            <div class="block">
                <p>password</p>
                <ns-password @input="v => change(v)" @submit="v => comfirmChange(v)" :length="10" :useConfirm="true"/>
            </div>
            <div class="block">
                <p>text</p>
                <ns-text @input="v => change(v)" @submit="v => comfirmChange(v)" :length="10"/>
            </div>
    
            <h4>Select</h4>
            <div class="block">
                <div>
                    <p>checkbox</p>
                    <ns-checkbox :options="options" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
                <div>
                    <p>checkbox Group</p>
                    <ns-checkbox :options="groupOptions" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
            </div>

            <div class="block">
                <div>
                    <p>dropdown</p>
                    <ns-dropdown :options="options" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
                <div>
                    <p>dropdown Group</p>
                    <ns-dropdown :options="groupOptions" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
            </div>

            <div class="block">
                <div>
                    <p>select</p>
                    <ns-select :options="options" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
                <div>
                    <p>select Group</p>
                    <ns-select :options="groupOptions" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
            </div>

            <div class="block">
                <div>
                    <p>radio</p>
                    <ns-radio :options="options" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
                <div>
                    <p>radio Group</p>
                    <ns-radio :options="groupOptions" @change="v => change(v)" @submit="v => comfirmChange(v)"/>
                </div>
            </div>

            <div class="block">
                <p>slider</p>
                <ns-slider @input="v => change(v)" @submit="v => comfirmChange(v)" :min="-5" :max="88" :step="10" :label="sliderLabel"/>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.wrapper{
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 600px;
    margin: auto;
    padding-bottom: 500px;

    .block{
        width: 100%;
        display: flex;
        gap: 10px;
        p{
            min-width: 40%;
            text-align: center;
        }

        div {
            flex-grow: 1;
        }
    }
}
</style>