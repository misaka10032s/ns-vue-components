<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, nextTick, onUnmounted, defineEmits } from 'vue'
    import { Draggable, gsap } from 'gsap/all'
    import { supfnc } from '@/js/NSsupportFnc.js'
    import _ from 'lodash'

    gsap.registerPlugin(Draggable);

    const emit = defineEmits(["dragchange"]);

    const $el = ref(null);
    const props = defineProps({
        data: Array,
        config: Object
    });
    var { data, config } = toRefs(props);

    var options = ref({
        enableAdd: 1,
        enableDel: 1,
    });
    var tiles = ref([]);
    var notSystemUpdate = ref(1);

    var rowSize = ref(config.value.rowSize || 100);
    var colSize = ref(config.value.colSize || 100);
    var gutter = ref(7);     // Spacing between tiles
    var threshold = ref("50%"); // This is amount of overlap between tiles needed to detect a collision

    var $list = ref(null);

    // Live node list of tiles
    var tilesNode = ref(null);
    var label = ref(1);
    var zIndex = ref(1000);

    var listWidth = ref(null);
    var colCount = ref(null);
    var rowCount = ref(null);
    var gutterStep = ref(null);

    var shadow1 = ref("0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)");
    var shadow2 = ref("0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)");

    var removeTile = function(tileIdx){
        var tile = $list.value[0].getElementsByClassName("tile")[tileIdx];
        if(tile) {
            tiles.value.splice(tileIdx, 1);

            var timeline = gsap.timeline();
            var from = {
                autoAlpha: 1,
                scale: 1,
                zIndex: zIndex.value
            }

            var to = {
                autoAlpha: 0,
                boxShadow: shadow1.value,
                height: tile.height,
                scale: 0,
                width: tile.width,
                onComplete:()=>{
                    tile.remove();
                    layoutInvalidated();
                }
            };

            timeline.fromTo(tile, 0.2, from, to);
        }
        tilesNode.value = $list.value[0].getElementsByClassName("tile");
    };
    var createTile = function(tileIdx, ctx, insertAt) {
        var eventListener = null;
        tiles.value.insert(ctx, tileIdx);
        if(typeof ctx == "string" || typeof ctx == "number"){
            var element = supfnc.createElement("div", {class:["tile", "tileDefault"]});
            element.innerHTML = ctx;
            // element.addEventListener("click", (ev)=>{console.log(ev)});
        }
        else if(Object.isDict(ctx)){
            if(!ctx.class) ctx.class = ["tileDefault"];
            var element = supfnc.createElement("div", ctx);
            element.innerHTML = ctx.html || ctx.txt || "";
            element.classList.add("popupTableItem");
            element.classList.add("tile");
            
            supfnc.bindEvent(element, config.value?.events, element, ctx);
        }
        $list.value[0].append(element);
        var colWidth = element.offsetWidth;
        var colspan = 1;
        var lastX = 0;

        Draggable.create(element, {
            onDrag: onDrag,
            onPress: onPress,
            onRelease: onRelease,
            zIndexBoost: false
        });

        // NOTE: Leave rowspan set to 1 because this demo 
        // doesn't calculate different row heights
        var tile = {
            col: null,
            colWidth: colWidth,
            colspan: colspan,
            element: element,
            height: 0,
            inBounds: true,
            index: null,
            isDragging: false,
            lastIndex: null,
            newTile: true,
            positioned: false,
            row: null,
            rowspan: 1,
            width: 0,
            x: 0,
            y: 0,
            eventListener: eventListener,
        };

        // Add tile properties to our element for quick lookup
        element.tile = tile;

        insertAt == undefined ? 0 : changePosition(tiles.value.length - 1, insertAt, undefined, 1);
        // layoutInvalidated();

        function onPress() {

            lastX = this.x;
            tile.isDragging = true;
            tile.lastIndex = tile.index;

            gsap.to(element, 0.2, {
                autoAlpha: 0.75,
                boxShadow: shadow2.value,
                scale: 0.95,
                zIndex: "+=1000"
            });
        }

        function onDrag() {

            // Move to end of list if not in bounds
            if (!this.hitTest($list.value, 0)) {
                tile.inBounds = false;
                changePosition(tile.index, tilesNode.value.length - 1);
                return;
            }

            tile.inBounds = true;

            for (var i = 0; i < tilesNode.value.length; i++) {

                // Row to update is used for a partial layout update
                // Shift left/right checks if the tile is being dragged 
                // towards the the tile it is testing
                var testTile = tilesNode.value[i].tile;
                var onSameRow = (tile.row === testTile.row);
                var rowToUpdate = onSameRow ? tile.row : -1;
                var shiftLeft = onSameRow ? (this.x < lastX && tile.index > i) : true;
                var shiftRight = onSameRow ? (this.x > lastX && tile.index < i) : true;
                var validMove = (testTile.positioned && (shiftLeft || shiftRight));
// console.log(i, this.hitTest(tilesNode.value[i], threshold.value) && validMove, this.hitTest(tilesNode.value[i], threshold.value), validMove, rowToUpdate)
                if (this.hitTest(tilesNode.value[i], threshold.value) && validMove) {
                    changePosition(tile.index, i, rowToUpdate);
                    break;
                }
            }

            lastX = this.x;
        }

        function onRelease() {
            
            // Move tile back to last position if released out of bounds
            this.hitTest($list.value, 0)
                ? layoutInvalidated()
                : changePosition(tile.index, tile.lastIndex);

            gsap.to(element, 0.2, {
                autoAlpha: 1,
                boxShadow: shadow1.value,
                scale: 1,
                x: tile.x,
                y: tile.y,
                zIndex: ++zIndex.value
            });

            tile.isDragging = false;
        }

        tilesNode.value = $list.value[0].getElementsByClassName("tile");
    };
    var resize = function() {
        listWidth.value = $list.value[0].offsetWidth;
        rowCount.value = -1;

        layoutInvalidated();
    };
    var changePosition = function(from, to, rowToUpdate, noEditList) {
        var $tilesNode = [...$el.value?.getElementsByClassName("tile")];
        // Change DOM positions

        $tilesNode[from].parentElement.insertBefore($tilesNode[from], $tilesNode[from < to ? to+1: to]);
        // $tilesNode.eq(from)[insert]($tilesNode.eq(to));
        if(!noEditList){
            tiles.value.moveft(from, to);
            data.value.moveft(from, to);
            emit("dragchange", from, to);
        }

        layoutInvalidated(rowToUpdate);
    };
    var layoutInvalidated = function(rowToUpdate) {
        var timeline = gsap.timeline();
        var partialLayout = (rowToUpdate > -1);

        var height = 0;
        var col = 0;
        var row = 0;
        var time = 0.35;
        var prevX = 0;

        var tileTmp = [...$el.value?.getElementsByClassName("tile")];
        for(var index in tileTmp){
            var element = tileTmp[index];

            var tile = element.tile;
            var oldRow = tile.row;
            var oldx = tile.x;
            var newTile = tile.newTile;
            
            // PARTIAL LAYOUT: This condition can only occur while a tile is being 
            // dragged. The purpose of this is to only swap positions within a row, 
            // which will prevent a tile from jumping to another row if a space
            // is available. Without this, a large tile in column 0 may appear 
            // to be stuck if hit by a smaller tile, and if there is space in the 
            // row above for the smaller tile. When the user stops dragging the 
            // tile, a full layout update will happen, allowing tiles to move to
            // available spaces in rows above them.
            if (partialLayout) {
                row = tile.row;
                if (tile.row !== rowToUpdate) continue;
            }

            // Update trackers when colCount is exceeded 
            if (prevX + tile.colWidth > listWidth.value) {
                prevX = col = 0; row++;
            }
            
            var attrs = {
                col: col,
                row: row,
                index: parseInt(index),
                x: prevX,
                y: row * gutter.value + (row * rowSize.value),
                width: tile.colWidth,
                height: rowSize.value
            }
            for(var i in attrs){
                tile[i] = attrs[i];
            }

            col += 1;
            prevX += tile.colWidth + gutter.value;

            // If the tile being dragged is in bounds, set a new
            // last index in case it goes out of bounds
            if (tile.isDragging && tile.inBounds) {
                tile.lastIndex = parseInt(index);
            }

            if (newTile) {

                // Clear the new tile flag
                tile.newTile = false;

                var from = {
                    autoAlpha: 0,
                    boxShadow: shadow1.value,
                    height: tile.height,
                    scale: 0,
                    width: tile.width
                };

                var to = {
                    autoAlpha: 1,
                    scale: 1,
                    zIndex: zIndex.value
                }

                timeline.fromTo(element, time, from, to, "reflow");
            }

            // Don't animate the tile that is being dragged and
            // only animate the tiles that have changes
            if (!tile.isDragging && (oldRow !== tile.row || oldx !== tile.x)) {

                var duration = newTile ? 0 : time;

                // Boost the z-index for tiles that will travel over 
                // another tile due to a row change
                if (oldRow !== tile.row) {
                    timeline.set(element, { zIndex: ++zIndex.value }, "reflow");
                }

                timeline.to(element, duration, {
                    x: tile.x,
                    y: tile.y,
                    onComplete: function () { tile.positioned = true; },
                    onStart: function () { tile.positioned = false; }
                }, "reflow");
            }
        }

        // If the row count has changed, change the height of the container
        if (row !== rowCount.value) {
            rowCount.value = row;
            height = rowCount.value * gutter.value + (++row * rowSize.value) + 5;
            timeline.to($list.value, 0.2, { height: height }, "reflow");
        }
    };

    var reviseTiles = function(){
        var boundX, boundY, tmp, L = tilesNode.value.length;
        boundX = tilesNode.value[0].parentElement.getBoundingClientRect().x;
        boundY = tilesNode.value[0].parentElement.getBoundingClientRect().y;
        for(var i=0; i<L; i++){
            tmp = tilesNode.value[i].getBoundingClientRect();
            tilesNode.value[i].tile.x = tmp.x - boundX;
            tilesNode.value[i].tile.y = tmp.y - boundY;
            tilesNode.value[i].tile.colWidth = tilesNode.value[i].offsetWidth;
        }
    }

    var mountedF = () => {
        console.log("$el", $el, $el.value.__vnode);
        
        $list.value = [...$el.value?.getElementsByClassName("tileList")];
        // Live node list of tiles
        tilesNode.value = $list.value[0].getElementsByClassName("tile");
        window.addEventListener("resize", resize);

        nextTick(()=>{
            listWidth.value = $list.value[0].offsetWidth;
            data.value.forEach((e, i) => {createTile(i, e)});
            layoutInvalidated();
        });
    }

    onMounted(mountedF);

    var detectDataDiff = ref(0), diffInterval = ref(0);
    diffInterval.value = setInterval(() => {
        if(!_.isEqual(tiles.value, data.value)) detectDataDiff.value++;
    }, 100);

    onUnmounted(()=>{
        clearInterval(diffInterval.value);
        window.removeEventListener("resize", resize);
    });

    watch(() => detectDataDiff.value, function(){
        if(!notSystemUpdate.value) return;
        notSystemUpdate.value = 0;
        var fromTo = supfnc.arrayFromToB(tiles.value, data.value);
        // console.log(fromTo);
        for(var i in fromTo.delIdx){
            removeTile(fromTo.delIdx[i]);
        }

        for(var i in fromTo.addIdx){
            createTile(fromTo.addIdx[i], fromTo.add[i], fromTo.addIdx[i]);
        }
        layoutInvalidated();
        notSystemUpdate.value = 1;
    }, {deep:true});
    
</script>

<template>
    <div ref="$el">
        <div class="tileList">
        </div>
    </div>
</template>

<style lang="scss">
.dropliast{
    background-color: rgba(0, 0, 0, 0.2);
    width: 100%;
    position: relative !important;
    display: block;
    margin-top: 50px;
}
.tile{
    position: absolute !important;
}
.tileDefault{
    display: block;
    background-color: yellowgreen;
    color: #3A3A4D;
    padding: 5px;
    font-weight: bold;
    min-width: 100px;
    min-height: 100px;
}
</style>