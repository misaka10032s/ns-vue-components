<script setup>
import { ref, toRefs, onMounted, watch } from 'vue'
import { Power1, Power2 } from 'gsap/all'

const $el = ref(null);

const props = defineProps({
    isShowing: Number
});
const { isShowing } = toRefs(props);

//Pure JS, completely customizable preloader from GreenSock.
//Once you create an instance like var preloader = new GSPreloader(), call preloader.active(true) to open it, preloader.active(false) to close it, and preloader.active() to get the current status. Only requires gsap and CSSPlugin (https://www.greensock.com/gsap/)
var preloader = ref(null);

var compensatedSkew = (d = 0) => {
    d = d/180*Math.PI;
    var c = Math.cos(d), s = Math.sin(d);
    c = Math.round(c*1E5) / 1E5;
    s = Math.round(s*1E5) / 1E5;
    return "matrix(" + c + "," + -s + "," + s + "," + c + ",42,0)";
}


//this is the whole preloader class/function
class GSPreloader{
    constructor(options) {
        options = options || {};
        var element = $el.value,
            radius = options.radius || 42,
            dotSize = options.dotSize || 15,
            animationOffset = options.animationOffset || 1.8, //jumps to a more active part of the animation initially (just looks cooler especially when the preloader isn't displayed for very long)
            createDot = function (rotation) {
                var dot = document.createElement("div");
                element.appendChild(dot);
                gsap.set(dot, { width: dotSize, height: dotSize, transformOrigin: (-radius + "px 0px"), x: radius, backgroundColor: colors[colors.length - 1], borderRadius: "50%", force3D: true, position: "absolute", rotation: rotation });
                dot.className = options.dotClass || "preloader-dot";
                return dot;
            },
            i = options.dotCount || 10,
            rotationIncrement = 360 / i,
            colors = options.colors || ["#61AC27", "black"],
            animation = new TimelineLite({ paused: true }),
            dots = [],
            isActive = false,
            box = document.createElement("div"),
            tl, dot, closingAnimation, j;
        colors.push(colors.shift());

        //setup background box
        gsap.set(box, { width: radius * 2 + 70, height: radius * 2 + 70, borderRadius: "14px", backgroundColor: options.boxColor || "white", border: options.boxBorder || "1px solid #AAA", position: "absolute", xPercent: -50, yPercent: -50, opacity: ((options.boxOpacity != null) ? options.boxOpacity : 0.3) });
        box.className = options.boxClass || "preloader-box";
        element.appendChild(box);

        gsap.set(element, { position: "fixed", top: "45%", left: "50%", perspective: 600, overflow: "visible", zIndex: 2000 });
        animation.from(box, 0.1, { opacity: 0, scale: 0.1, ease: Power1.easeOut }, animationOffset);
        while (--i > -1) {
            dot = createDot(i * rotationIncrement);
            dots.unshift(dot);
            animation.from(dot, 0.1, { scale: 0.01, opacity: 0, ease: Power1.easeOut }, animationOffset);
            //tuck the repeating parts of the animation into a nested TimelineMax (the intro shouldn't be repeated)
            tl = gsap.timeline({ repeat: -1, repeatDelay: 0.25 });
            for (j = 0; j < colors.length; j++) {
                tl.to(dot, 2.5, { rotation: "-=360", ease: Power2.easeInOut }, j * 2.9)
                .to(dot, 1.2, { rotateX: "-=360", backgroundColor: colors[j], ease: Power2.easeInOut }, 1.6 + 2.9 * j);

                // for(var k=1; k<=8; k++){
                //     tl.to(dot, 1.2/8, { transform: compensatedSkew(45*k), backgroundColor: colors[j], ease: Power2.easeInOut }, 1.2/8*k + 2.9 * j)
                // }
                // .to(dot, 1.2, { skewX: "+=360", backgroundColor: colors[j], ease: Power2.easeInOut }, 1.6 + 2.9 * j);
            }
            //stagger its placement into the master timeline
            animation.add(tl, i * 0.07);
        }
        if (gsap.render) {
            gsap.render(); //trigger the from() tweens' lazy-rendering (otherwise it'd take one tick to render everything in the beginning state, thus things may flash on the screen for a moment initially). There are other ways around this, but gsap.render() is probably the simplest in this case.
        }

        //call preloader.active(true) to open the preloader, preloader.active(false) to close it, or preloader.active() to get the current state.
        this.active = function (show) {
            if (!arguments.length) {
                return isActive;
            }
            if (show === -1){
                this.active(!this.active());
                return;
            }
            if (isActive != show) {
                isActive = show;
                if (closingAnimation) {
                    closingAnimation.kill(); //in case the preloader is made active/inactive/active/inactive really fast and there's still a closing animation running, kill it.
                }
                if (isActive) {
                    element.style.visibility = "visible";
                    gsap.set([element, box], { rotation: 0 });
                    animation.play(animationOffset);
                } else {
                    closingAnimation = new TimelineLite();
                    if (animation.time() < animationOffset + 0.3) {
                        animation.pause();
                        closingAnimation.to(element, 1, { rotation: -360, ease: Power1.easeInOut }).to(box, 1, { rotation: 360, ease: Power1.easeInOut }, 0);
                    }
                    closingAnimation.staggerTo(dots, 0.3, { scale: 0.01, opacity: 0, ease: Power1.easeIn, overwrite: false }, 0.05, 0).to(box, 0.4, { opacity: 0, scale: 0.2, ease: Power2.easeIn, overwrite: false }, 0).call(function () { animation.pause(); closingAnimation = null; }).set(element, { visibility: "hidden" });
                }
            }
            return this;
        };
    }
}

var mountedF = () => {
    preloader.value = new GSPreloader({
        radius: 42,
        dotSize: 15,
        dotCount: 10,
        colors: ["#61AC27", "#555", "purple", "#FF6600"], //have as many or as few colors as you want.
        boxOpacity: 0.2,
        boxBorder: "1px solid #AAA",
        animationOffset: 1.8, //jump 1.8 seconds into the animation for a more active part of the spinning initially (just looks a bit better in my opinion)
    });
}

onMounted(mountedF);

watch(()=>isShowing.value, function(){
    console.log(isShowing.value)
    preloader.value.active(isShowing.value);
});

</script>

<template>
    <div ref="$el">
    </div>
</template>

<style lang="scss">

</style>