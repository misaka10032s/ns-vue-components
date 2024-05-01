<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, onUnmounted } from 'vue'
    import { Draggable, gsap, Quint, Quad, Elastic } from 'gsap/all'

    const $el = ref(null);
    const props = defineProps({
        btns: Array,
        config: Object,
    });
    var { btns, config } = toRefs(props);

    const angle = config.value.angle || 360;
    const baseline = config.value.baseline || 0;
    const slice = config.value.slice || 45;
    const oneFlrNum = Math.floor(angle / slice) + 1;
    const menuToggleButtonFnc = typeof config.value?.menu?.click == "function" ? config.value.menu.click : ()=>{};
    const menuCallbackOpen = typeof config.value?.menu?.open == "function" ? config.value.menu.open : ()=>{};
    const menuCallbackClose = typeof config.value?.menu?.close == "function" ? config.value.menu.close : ()=>{};
    const menuToggleButtonArgs = Array.isArray(config.value?.menu?.args) ? config.value.menu.args : [];

    var switchAnimate = ref([]), btnsAnimate = ref([]);
    var menu = ref([]);
    menu.value = btns.value.slice(0, 1080 / slice);
    if (menu.value) {
        for (var i in menu.value) {
            if (typeof menu.value[i].click != "function") {
                menu.value[i].click = (e) => {}
            }
        }
    }
    else {
        menu.value = [];
    }


    var documentMouseUp = () => {
        gsap.to($el.value?.getElementsByClassName("menu-toggle-icon"), 0.1, {
            scale: 1
        });
    }
    var documentTouchend = () => {
        document.dispatchEvent(new Event("mouseup"));
    }
    

    var mountedF = () => {
        var menuItemNum = $el.value?.getElementsByClassName("menu-item").length;
        var totalFlr = Math.ceil(menuItemNum / oneFlrNum);
        var angleT = slice * (menuItemNum % 2);
        var distance = 90;
        // var startingAngle = Math.max(180 + (-angleT / 2), ((menuItemNum + totalFlr) % 2) * slice / 2);
        var startingAngle = 180 - angleT;
        [...$el.value?.getElementsByClassName("menu-item")].forEach(function (e,i) {
            var angle = startingAngle + (slice * i) + adjustment(i, "startingAngle");
            e.style.transform = "rotate(" + (angle) + "deg)";
            e.getElementsByClassName("menu-item-icon")[0].style.transform = "rotate(" + (-angle) + "deg)";
        })
        var on = false;
        var menuToggleButton = $el.value?.getElementsByClassName("menu-toggle-button")[0];

        menuToggleButton.addEventListener("mousedown", function () {
            gsap.to($el.value?.getElementsByClassName("menu-toggle-icon"), 0.1, {
                scale: 0.65
            })
        })
        
        document.addEventListener("mouseup", documentMouseUp);
        document.addEventListener("touchend", documentTouchend);

        menuToggleButton.addEventListener("mousedown", pressHandler);
        menuToggleButton.addEventListener("touchstart", function (event) {
            menuToggleButton.dispatchEvent(new Event("mousedown"));
            event.preventDefault();
            event.stopPropagation();
        });

        function pressHandler(event) {
            on = !on;

            gsap.to([...$el.value?.getElementsByClassName("menu-toggle-icon")], 0.4, {
                rotation: on ? 45 : 0,
                ease: Quint.easeInOut,
                force3D: true
            });

            on ? openMenu() : closeMenu();

        }
        function openMenu() {
            [...$el.value?.getElementsByClassName("menu-item")].forEach(function(e,i){
                
                if(btnsAnimate.value[i]){
                    switchAnimate.value[i].kill();
                    btnsAnimate.value[i].kill();
                }
                var delay = i * (0.05 + 0.2 / menuItemNum);

                var $bounce = e.getElementsByClassName("menu-item-bounce")[0];

                switchAnimate.value[i] = gsap.fromTo($bounce, 0.2, {
                    transformOrigin: "50% 50%"
                }, {
                    delay: delay,
                    scaleX: 0.8,
                    scaleY: 1.2,
                    force3D: true,
                    ease: Quad.easeInOut,
                    onComplete: function () {
                        gsap.to($bounce, 0.15, {
                            // scaleX:1.2,
                            scaleY: 0.7,
                            force3D: true,
                            ease: Quad.easeInOut,
                            onComplete: function () {
                                menuCallbackOpen();
                                gsap.to($bounce, 3, {
                                    // scaleX:1,
                                    scaleY: 0.8,
                                    force3D: true,
                                    ease: Elastic.easeOut,
                                    // easeParams: [1.1, 0.12]
                                })
                            }
                        })
                    }
                });

                btnsAnimate.value[i] = gsap.to(e.getElementsByClassName("menu-item-button")[0], 0.5, {
                    delay: delay,
                    y: distance * adjustment(i, "distance"),
                    force3D: true,
                    ease: Quint.easeInOut
                });
            });
        }
        function closeMenu(){
            [...$el.value?.getElementsByClassName("menu-item")].forEach(function(e,i){
                
                if(btnsAnimate.value[i]){
                    switchAnimate.value[i].kill();
                    btnsAnimate.value[i].kill();
                }
                var delay = i * (0.25 / menuItemNum);

                var $bounce = e.getElementsByClassName("menu-item-bounce")[0];

                switchAnimate.value[i] = gsap.fromTo($bounce, 0.2, {
                    transformOrigin: "50% 50%"
                }, {
                    delay: delay,
                    scaleX: 1,
                    scaleY: 0.8,
                    force3D: true,
                    ease: Quad.easeInOut,
                    onComplete: function () {
                        gsap.to($bounce, 0.15, {
                            // scaleX:1.2,
                            scaleY: 1.2,
                            force3D: true,
                            ease: Quad.easeInOut,
                            onComplete: function () {
                                menuCallbackClose();
                                gsap.to($bounce, 3, {
                                    // scaleX:1,
                                    scaleY: 1,
                                    force3D: true,
                                    ease: Elastic.easeOut,
                                    // easeParams: [1.1, 0.12]
                                })
                            }
                        })
                    }
                });

                btnsAnimate.value[i] = gsap.to(e.getElementsByClassName("menu-item-button")[0], 0.3, {
                    delay: delay,
                    y: 0,
                    force3D: true,
                    ease: Quint.easeIn
                });
            });
        }

        function adjustment(i, argw) {
            var x = Math.floor(i / oneFlrNum),
            outer = Math.floor(menuItemNum / oneFlrNum) == Math.floor(i / oneFlrNum),
            outerNum = menuItemNum % oneFlrNum,
            dAng = (outer ? Math.floor((oneFlrNum - outerNum + (totalFlr % 2)) / 2) * slice - baseline: 0);
            var r = {
                distance: [1, 1.6, 2],
                startingAngle: [0, 180 / oneFlrNum + dAng, dAng]
            }
            return r[argw][x];
        }
    };

    onMounted(mountedF);

    onUnmounted(()=>{
        document.removeEventListener("mouseup", documentMouseUp);
        document.removeEventListener("touchend", documentTouchend);
    });
</script>

<template>
    <div class="menu" ref="$el">
        <div class="menu-wrapper">
            <ul class="menu-items">
                <li class="menu-item" v-for="item in menu">
                    <button class="menu-item-button" @click="item.click($event, ...item.args)" :title="item.title">
                        <i :class="item.icon" class="menu-item-icon"></i>
                    </button>
                    <div class="menu-item-bounce">
                    </div>
                </li>
            </ul>
            <button class="menu-toggle-button" @click="menuToggleButtonFnc($event, ...menuToggleButtonArgs)">
                <i class="iconfont icon-add menu-toggle-icon"></i>
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.menu {
    position: relative;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

.menu-wrapper {
    position: absolute;
    left: 50%;
    bottom: 10px;
}

.menu-toggle-button,
.menu-item-bounce,
.menu-item-button {
    background: #4f4f64;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    margin-left: -40px;
    margin-top: -40px;
    height: 80px;
    color: #fff;
    border: none;
    outline: none;
    position: relative;
}

.menu-toggle-button {
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
}

.menu-toggle-icon {
    font-size: 30px;
    position: absolute;
    top: 0;
    left: 0;
    width: 80px;
    height: 80px;
    line-height: 80px;
}

.menu-items {
    list-style-type: none;
    padding: 0;
    margin: 0;
    position: absolute;
    left: 0;
    top: 0;
}

.menu-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
}

.menu-item-bounce {
    position: absolute;
    top: 0;
    left: 0;
}

.menu-item-button {
    width: 60px;
    height: 60px;
    margin-left: -30px;
    margin-top: -30px;
    position: absolute;
    top: 0;
    left: 0;
    .iconfont {
        font-size: 1.5rem;
        color: #fff;
        display: inline-block;
    }
}

@font-face {
    font-family: "iconfont";
    src: url('iconfont.eot?t=1535154355363');
    /* IE9*/
    src: url('iconfont.eot?t=1535154355363#iefix') format('embedded-opentype'),
        /* IE6-IE8 */
        url('data:application/x-font-woff;charset=utf-8;base64,d09GRgABAAAAAAbAAAsAAAAACcgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADMAAABCsP6z7U9TLzIAAAE8AAAARAAAAFY9J0kPY21hcAAAAYAAAABtAAABstIXn9dnbHlmAAAB8AAAArwAAANotA7acmhlYWQAAASsAAAAMQAAADYSdbc/aGhlYQAABOAAAAAgAAAAJAfoA3xobXR4AAAFAAAAABMAAAAUFAD//2xvY2EAAAUUAAAADAAAAAwBtALWbWF4cAAABSAAAAAfAAAAIAEVAHtuYW1lAAAFQAAAAUUAAAJtPlT+fXBvc3QAAAaIAAAANgAAAEd5SQi/eJxjYGRgYOBikGPQYWB0cfMJYeBgYGGAAJAMY05meiJQDMoDyrGAaQ4gZoOIAgCKIwNPAHicY2BkYWCcwMDKwMHUyXSGgYGhH0IzvmYwYuRgYGBiYGVmwAoC0lxTGByezXguy9zwv4EhhrmBYSZQmBEkBwDsuQyyeJztkbsNgDAMRF8+IIRYgQ0YgoGomIYya7CQM0awYwqG4KwX2afIxRkYgKRsSoZwEjAd6obuJ+buZ3adZyYiUS4pcte1Nfj2r4L+87I+6g7bPfJr6e/+TtnScyxtKY4mhtyOXaeuDvkBwgcdTwAAAHicVVLPaxNBFJ43253ZmZ3Zzf6usklJajZqNNE03TT+aKIieBBFtHrz6qEqKKgHLwoexZPFkxe9+R8IPeTiQUH0WMWinkQKHkQQSrN1xmLB4fHevI833+PN+5CJ0OaSsW5cQGWUoTaaQ8cQ6lUgqQZ51qjWSBgn1Q41etVa1jBa4EACLdBwJ290804cklpW30bmYQtZ450Kbt5n07XxL9txbCw88+7k+Jszab6f8ENmwG3oL8zNLfSX0maqDD8DlShoCdK95fLe9FW6C2BUbYMbOVAqzvu+wIucUZ9vvGn2+xf7/Wak6srl6L8MqUM2NzevTHDjFgpQAx1GZ9FldB0hyOMkqMA8NIysRg1SgbxnVsBVM1VgAGrces0BVROTNmTqNgVx/m9mkvWCvAVEvYsHiqMFFLLtsnl9z7dwF2u+GVjhLrs5EYR04saO0zvvmFYQmPjcDjNYtbATstVmcqj4bJew5A+IiNdZaJtsvTvPj2AvsnHhxoKcwHbkGcfto90NRuyAF0+rzh4rdICu/PVn3NI1WxiuffUSl1Dixr4E4uI3s6yAgzXbLTa4zygfGo67TMMSkOXGKWtKRC4eL08yuWSafkAep80+JLZtluxiRbJJSLhn2rz43t+fPjIDn5gwLIs6hVJIRwTckH4HLLAbCRCW2o5EWH+6sYjXkI0S9c+dvJtN/5XODGhVzHrdrEYiY4EJwcYXtYeh8IUyWNyKxUij+IX2yFCavGeM1P52Kz2eVIwzSpCeluCsR2c0fWPagcjTMtX0LdC5alfvTSd6w22ger0D8HT/3lZ//PJJmkEyPljOkq9cSv6VSRgcwO9UGLafMClZ8fx17TXxHSAfPqpRPfpcBgJkIOED1MsFSrIUo1hjIHiB2gOQDKuAQQTy4ZdPFKRn/fhJfQn07XjIheB4pIn/AMiujqN4nGNgZGBgAOIl8nN94/ltvjJwszCAwPVlOzfD6P///6ezcDGXArkcDEwgUQBcRw0kAAAAeJxjYGRgYG7438AQw8Lw////byxcDEARFMAKAKCyBmt4nGNhYGBgAeP//1mgbAAT8QITAAAAAAAAagEiAUoBtHicY2BkYGBgZchnYGMAASYg5gJCBob/YD4DABQyAZEAeJxlj01OwzAQhV/6B6QSqqhgh+QFYgEo/RGrblhUavdddN+mTpsqiSPHrdQDcB6OwAk4AtyAO/BIJ5s2lsffvHljTwDc4Acejt8t95E9XDI7cg0XuBeuU38QbpBfhJto41W4Rf1N2MczpsJtdGF5g9e4YvaEd2EPHXwI13CNT+E69S/hBvlbuIk7/Aq30PHqwj7mXle4jUcv9sdWL5xeqeVBxaHJIpM5v4KZXu+Sha3S6pxrW8QmU4OgX0lTnWlb3VPs10PnIhVZk6oJqzpJjMqt2erQBRvn8lGvF4kehCblWGP+tsYCjnEFhSUOjDFCGGSIyujoO1Vm9K+xQ8Jee1Y9zed0WxTU/3OFAQL0z1xTurLSeTpPgT1fG1J1dCtuy56UNJFezUkSskJe1rZUQuoBNmVXjhF6XNGJPyhnSP8ACVpuyAAAAHicY2BigAAuBuyAlZGJkZmRhZGVkY2BJTmxqIQjLbEsvyizJJU5MSWFtTgjsSiVgQEAfQEIhQAA') format('woff'),
        url('iconfont.ttf?t=1535154355363') format('truetype'),
        /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
        url('iconfont.svg?t=1535154355363#iconfont') format('svg');
    /* iOS 4.1- */
}

.iconfont {
    font-family: "iconfont" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.icon-cart:before {
    content: "\e698";
}

.icon-favorite:before {
    content: "\e6a0";
}

.icon-add:before {
    content: "\e6b9";
}

.icon-share:before {
    content: "\e71d";
}
</style>