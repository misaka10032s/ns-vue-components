<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, nextTick, onUnmounted } from 'vue'
    import { Draggable, gsap, Back, Quad } from 'gsap/all'
    import { supfnc } from '@/js/NSsupportFnc.js'

    const $el = ref(null);

    const props = defineProps({
        scale: Number,
        image: String
    });
    var { scale, image } = toRefs(props);
    
    var puzzleSize = ref(Math.min(Math.max(scale.value, 2), 10));
    var puzzleImage = ref(image.value || "/NS2dCubePuzzle.jpg");

    class NS2dCubePuzzle{
        constructor(scale = 2){
            var T = this, zeroAt = scale**2-1, puzzle = [];
            var puzzleSave, zeroAtSave;

            for(var i=scale**2-1; i>0; i--){
                puzzle.push(scale**2 - i);
            }
            puzzle.push(0);
            
            puzzleSave = puzzle.slice();
            zeroAtSave = zeroAt;

            this.move = (direction = 0) => {
                // direction 0123 up right down left
                if(Array.isArray(direction)){
                    var dirList = [];
                    for(var i in direction){
                        if(T.move(direction[i])) dirList.push(direction[i]);
                    }
                    return dirList;
                }

                var x = zeroAt % scale, y = Math.floor(zeroAt / scale);
                direction = Math.floor(direction);
                switch(direction){
                    case 0:
                        if(y == scale - 1) return 0;
                        puzzle[x + scale * y] = puzzle[x + scale * (y+1)];
                        puzzle[x + scale * (y+1)] = 0;
                        zeroAt += scale; 
                        return 1;

                    case 1:
                        if(x == 0) return 0;
                        puzzle[x + scale * y] = puzzle[x - 1 + scale * y];
                        puzzle[x - 1 + scale * y] = 0;
                        zeroAt -= 1; 
                        return 1;

                    case 2:
                        if(y == 0) return 0;
                        puzzle[x + scale * y] = puzzle[x + scale * (y-1)];
                        puzzle[x + scale * (y-1)] = 0;
                        zeroAt -= scale; 
                        return 1;

                    case 3:
                        if(x == scale - 1) return 0;
                        puzzle[x + scale * y] = puzzle[x + 1 + scale * y];
                        puzzle[x + 1 + scale * y] = 0;
                        zeroAt += 1; 
                        return 1;

                    default:
                        if(y == scale - 1) return 0;
                        puzzle[x + scale * y] = puzzle[x + scale * (y+1)];
                        puzzle[x + scale * (y+1)] = 0;
                        zeroAt += scale; 
                        return 1;
                }
            }

            this.reset = () => {
                for(var i=scale**2-1; i>0; i--){
                    puzzle[i] = scale**2 - i;
                }
                puzzle[scale**2 - 1] = 0;
            }

            this.savePuzzle = () => {
                puzzleSave = puzzle.slice();
                zeroAtSave = zeroAt;
            }

            this.readPuzzle = () => {
                puzzle = puzzleSave.slice();
                zeroAt = zeroAtSave;
            }

            this.shuffle = (s = 1) => {
                var t = 0;
                while(t++<scale**4) T.move(Math.random() * 4);
                while(s){
                    T.shuffle(0);
                    s = T.check();
                }
            }

            this.check = () => {
                for(let i=0; i<puzzle.length; i++){
                    if(puzzle[i] != (i+1)%puzzle.length){
                        return 0;
                    }
                }
                return 1;
            }

            this.getPuzzle = () => {
                return puzzle.slice();
            }

            this.solveS = () => {
                var step = [], zeroPos, nowItemPos;
                // [3,2,1,0,1,2,3,0,3,2,1,0,3,2,1,1,0,3,3,2,1,0]
                var getPuzzleItemPos = (x = 0) => {
                    for(var i=0; i<scale**2; i++){
                        if(puzzle[i] == x){
                            return [i%scale, Math.floor(i/scale)];
                        }
                    }
                }
                zeroPos = getPuzzleItemPos(0);
                
                for(var i=1; i<scale**2; i++){
                    nowItemPos = getPuzzleItemPos(i);
                }
            }

            this.solveH = () => {
                var origPuzzle = puzzle.slice(), origZeroAt = zeroAt;
                var step = [], stepMap = [], past = {}, isOk = 0;
                past[puzzle.join()] = 1;

                var getLost = () => {
                    var c = 0;
                    for(var i=0; i<scale ** 2; i++){
                        if(puzzle[i]){
                            c += Math.abs(((puzzle[i]-1)%scale + Math.floor((puzzle[i]-1)/scale)) - (i%scale + Math.floor(i/scale)));
                        }
                        else {
                            c += Math.abs(2*(scale - 1) - (i%scale + Math.floor(i/scale)));
                        }
                    }
                    return c;
                };

                var tryStep = () => {
                    var thisStep, lost = [-1, -1, -1, -1], lostSort = [], direction;
                    for(var i=0; i<4; i++){
                        if((i+2)%4 == step.last() || !T.move(i)) continue;
                        lost[i] = getLost();
                        T.move((i+2)%4);
                    }

                    for(var i=0; i<4; i++){
                        var j=-1;
                        if(lost[i] == -1) continue;
                        while(lostSort[++j] < lost[i]);
                        lostSort.splice(j-1, 0, i);
                    }
                    // console.log(0, lostSort, step, isOk)

                    for(var i=0; i<lostSort.length; i++){
                        direction = lostSort[i];
                        if(isOk) {
                            return step;
                        }
                        if(step.length >= [6, 31, 80][scale - 2]) {
                            break;
                        }
                        if((direction+2)%4 == step.last() || !T.move(direction)) continue;
                        thisStep = puzzle.join();
                        // console.log(direction, thisStep, past[thisStep]);
                        if(!past[thisStep]) {
                            step.push(direction);
                            stepMap.push(thisStep);
                            past[thisStep] = 1;
                            if(T.check()) {
                                isOk = 1;
                                return step;
                            }
                            tryStep();
                        }
                        else {
                            T.move((direction+2)%4);
                        }
                    }
                    if(!isOk){
                        delete past[stepMap.pop()];
                        T.move((step.pop()+2)%4);
                    }
                    if(!step.length) isOk = 1;
                    return step;
                };
                var res = tryStep();
                puzzle = origPuzzle.slice();
                zeroAt = origZeroAt;
                return res;
            }
        }
    }

// var x = new NS2dCubePuzzle(3);
// x.shuffle();
// console.log(x.getPuzzle(), x.solveH(), x.getPuzzle());

    var puzzlePlaza = ref(null);
    var pMapObj = ref(new NS2dCubePuzzle(puzzleSize.value));
    var pMap = ref([]);
    var size = ref(60);
    var hideIndex = ref(1);
    var solveInterval = ref(0);
    var solveStepIndex = ref(0);
    var solveStep = ref(0);

    var startGame = () => {
        pMapObj.value.shuffle();
        pMapObj.value.savePuzzle();
        layoutInvalidated();
    };
    var resetGame = () => {
        pMapObj.value.readPuzzle();
        layoutInvalidated();
    };
    var moveBlock = (blockIdx) => {
        if(pMap.value[blockIdx-1] === 0) pMapObj.value.move(3);
        else if(pMap.value[blockIdx+1] === 0) pMapObj.value.move(1);
        else if(pMap.value[blockIdx-puzzleSize.value] === 0) pMapObj.value.move(0);
        else if(pMap.value[blockIdx+puzzleSize.value] === 0) pMapObj.value.move(2);
        
        layoutInvalidated();
    };
    var solveH = () => {
        solveStep.value = pMapObj.value.solveH();
    };
    var solveHStart = () => {
        if(!solveStep.value.length) solveH();
        console.log(solveStep.value)
        solveInterval.value = setInterval(()=>{
            if(solveStep.value[solveStepIndex.value] === undefined){
                solveStep.value = [];
                solveStepIndex.value = 0;
                clearInterval(solveInterval.value);
                return;
            }
            pMapObj.value.move(solveStep.value[solveStepIndex.value++]);
            layoutInvalidated(0.2);
        }, 200);
    };
    var solveHPause = () => {
        clearInterval(solveInterval.value);
    };
    var solveHReset = () => {
        solveStep.value = [];
        clearInterval(solveInterval.value);
    };

    var layoutInvalidated = (duration = 0.4) => {
        var puzzleItemList = [...puzzlePlaza.value.children];
        var fromTo = supfnc.arrayFromToB(pMap.value, pMapObj.value.getPuzzle());

        for(var i in fromTo.movIdx){
            var from = fromTo.movIdx[i][0], to = fromTo.movIdx[i][1];
            pMap.value.switch(from, to);
            puzzleItemList[from].parentElement.insertBefore(puzzleItemList[from], puzzleItemList[to].nextElementSibling);
            puzzleItemList[from].parentElement.insertBefore(puzzleItemList[to], puzzleItemList[from+1]);
            puzzleItemList.switch(from, to);
        }

        [...puzzlePlaza.value.children].forEach((e,i) => {
            e.config.index = parseInt(i);
            if(e.config.itemTag == puzzleSize.value**2 - 1 && !pMapObj.value.check()) {
                if(e.config.opacity?.kill) e.config.opacity.kill();
                e.config.opacity = gsap.to(e, 0.1, {opacity: 0});
            }
            gsap.to(e, duration, {x: (i%puzzleSize.value) * size.value, y: Math.floor(i/puzzleSize.value) * size.value, ease: Quad.easeInOut, onComplete:()=>{
                if(e.config.itemTag == puzzleSize.value**2 - 1 && pMapObj.value.check()){
                    if(e.config.opacity?.kill) e.config.opacity.kill();
                    e.config.opacity = gsap.to(e, 1, {opacity: 1, delay: duration/2});
                }
            }});
        });
    };

    var mountedF = () => {
        puzzlePlaza.value = $el.value.getElementsByClassName("puzzlePlaza")[0];
        
        pMap.value = pMapObj.value.getPuzzle();
        for(let i=0; i<puzzleSize.value**2; i++){
            var col = i % puzzleSize.value, row = Math.floor(i / puzzleSize.value), isEmptyItem = i==puzzleSize.value**2-1;
            let element = supfnc.createElement("div", {
                class: isEmptyItem ? ["puzzleItem", "emptyPuzzleItem"] : ["puzzleItem"],
                style: {
                    backgroundRepeat: "no-repeat",
                    backgroundImage: "url(" + puzzleImage.value + ")",
                    backgroundPosition: "-" + (size.value * col) + "px -" + (size.value * row) + "px",
                    backgroundSize: (size.value * puzzleSize.value) + "px " + (size.value * puzzleSize.value) + "px",
                    opacity: isEmptyItem ? 0 : 1,
                    height: size.value + "px",
                    width: size.value + "px",
                    lineHeight: (size.value - 4) + "px",
                },
            });
            element.innerHTML = isEmptyItem ? "" : i;
            element.addEventListener("click", ()=>{
                moveBlock(element.config.index);
            });
            element.config = {
                index: i,
                itemTag: i,
                itemCol: col,
                itemRow: row,
            }
            puzzlePlaza.value.appendChild(element);
            gsap.fromTo(element, 0.4, {scale: 0.2}, {scale: 1, ease: Back.easeOut.config(3)});
        }
        layoutInvalidated();
    }

    onMounted(mountedF);
// 1 2 4    1 2 5
// 3   5 to 3   4
// use => 321012301 230123301
// .move([3,2,1,0,1,2,3,0,1,2,3,0,1,2,3,3,0,1])
</script>

<template>
    <div ref="$el">
        <div>
            <button class="btn mx-2" @click="startGame()">Start Game</button>
            <button class="btn mx-2" @click="resetGame()">Reset Game</button>
            <button class="btn mx-2" @click="solveHStart()">solveHStart</button>
            <button class="btn mx-2" @click="solveHPause()">solveHPause</button>
            <button class="btn mx-2" @click="solveHReset()">solveHReset</button>
            <button class="btn mx-2" @click="hideIndex^=1">{{ hideIndex ? 'Show' : 'Hide'}} Index</button>
        </div>
        <div class="puzzlePlaza" :class="{'hideIndex': hideIndex}"></div>
    </div>
</template>

<style lang="scss">
.puzzlePlaza{
    position: relative !important;
    width: fit-content;
    height: fit-content;
    margin: auto;
}
.puzzleItem{
    position: absolute !important;
    text-align: center;
    overflow: hidden;
    &:not(.emptyPuzzleItem){
        cursor: pointer;
    }
    user-select: none;
}
.emptyPuzzleItem{
    background-color: transparent;
}
.hideIndex{
    color: transparent;
}
</style>