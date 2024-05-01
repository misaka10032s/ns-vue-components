<script>
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { Draggable, gsap, MotionPathPlugin, Linear, Quint } from 'gsap/all'

    gsap.registerPlugin(Draggable);
    gsap.registerPlugin(MotionPathPlugin);
// https://greensock.com/motionpath

    class tweexEX{
        // https://codepen.io/GreenSock/pen/LwzMKL
        static oval = (target, width, height, {threeD = false, horiz = true, callback = {}}) => {
            if(!target instanceof HTMLElement) return;
            if(typeof callback == "function"){
                callback = {
                    start: [callback],
                    complete: [callback],
                }
            }
            else if(Array.isArray(callback)){
                callback = {
                    start: callback,
                    complete: callback,
                }
            }
            else if(Object.isDict(callback)){
                if(typeof callback.start == "function") callback.start = [callback.start];
                if(typeof callback.complete == "function") callback.complete = [callback.complete];
            }

            target.style.position = "relative";
            if(target.svg) target.svg.remove();

            var x, y;

            var btns = [...target.children];
            var L = btns.length;

            var transform = horiz ? "matrix(-1, 0, 0, -1, 0, 0)": "matrix(-1, 0, 0, -1, 0, 0) rotate(90deg)";
            [x, y] = horiz ? [width, height]: [height, width];

            var uid = supfnc.randAlphabet(10);
            var svg = supfnc.createElementNS("svg", {style:{height: 2*height + "px", display: "block", margin: "auto"}, attr: {transform: transform}});
            var oval = supfnc.createElementNS("path", {id: uid, attr:{fill: "none", stroke: "none", d:`M ${x/2}, ${y} a ${width},${height} 0 1,0 1,0`}});
            var moving = 0;

            svg.appendChild(oval);
            target.appendChild(svg);
            target.svg = svg;

            const TWmove = async (el, bef, aft, dir, t = 0.01) => {
                dir= !!dir;

                for(var i in callback.start){
                    if(typeof callback.start[i] == "function") await callback.start[i](el, bef, aft, dir);
                }
                
                gsap.to(el, {
                    duration: t,
                    ease: Linear.easeNone,
                    // ease: Quint.easeInOut,
                    opacity: aft ? 0.5 * Math.max(aft, L-aft)/(L-1): 1,
                    motionPath:{
                        path: `#${uid}`,
                        align: `#${uid}`,
                        autoRotate: threeD,
                        alignOrigin: [0.5, 0.5],
                        start: bef/L + (!dir && aft>bef),
                        end: aft/L + (dir && aft<bef),
                    },
                    onComplete: async () => {
                        aft ? el.classList.remove("oval-front") : el.classList.add("oval-front");

                        if(!aft) el.style.zIndex = L;
                        else el.style.zIndex = Math.max(aft, L-aft);
                        
                        moving = 0;
                        for(var i in callback.complete){
                            if(typeof callback.complete[i] == "function") await callback.complete[i](el, bef, aft, dir);
                        }
                    },
                });
            }

            btns.forEach((el, idx) => {
                [el.style.position, el.style.left, el.style.top, el.idx] = ["absolute", "0", "0", idx];
                idx ? 0 : el.classList.add("oval-front");

                TWmove(el, idx, idx);

                if(el.bind) el.removeEventListener("click", el.bind);
                el.bind = event => {
                    if(moving || !el.idx) return;
                    moving = 1;
                    let moveNum, multiple;
                    idx = el.idx;
                    idx < L-idx ? (moveNum=idx, multiple=-1) : (moveNum=L-idx, multiple=1);

                    for(let i=0; i<L; i++){
                        btns[i].classList.remove("oval-front");
                        let befIdx = btns[i].idx, aftIdx = (befIdx + moveNum*multiple + L) % L;
                        TWmove(btns[i], befIdx, aftIdx, multiple>0, 0.4 + 0.1 * moveNum);
                        btns[i].idx = aftIdx;
                    }
                }
                el.addEventListener("click", el.bind);
            });
        }
    }

    export { tweexEX };
</script>