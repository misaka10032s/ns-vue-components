<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, nextTick, onUnmounted } from 'vue'
    import { Draggable, gsap } from 'gsap/all'
    import { supfnc } from '@/js/NSsupportFnc.js'

    gsap.registerPlugin(Draggable);

    const $el = ref(null);

    var graph = ref(null);
    var vertex = ref({}); // vid: {x, y, el}
    var edge = ref({}); // from: {to: {eid: {weight:weight, el:el, options:{color, } } } }

    var colorList = ["red", "orange", "yellow", "green", "blue", "purple", "gray"];
    
    var newVertex = (x = 0, y = 0, color = colorList.random()) => {
        var vid = supfnc.randAlphabet(10);
        var vtx = supfnc.createElement("div", {class: "vertex", style: {backgroundColor: color}});

        vertex.value[vid] = {x: x, y: y, el: vtx};
        graph.value.appendChild(vtx);
        vtx.config = {vid: vid, x: x, y: y};

        var onDrag = () => {
            var rect =  vtx.getBoundingClientRect();
            vtx.config.x = rect.x;
            vtx.config.y = rect.y;
            moveVertex(vid, rect.x, rect.y);
        };
        var onRelease = () => {};

        Draggable.create(vtx, {
            onDrag: onDrag,
            onRelease: onRelease,
            zIndexBoost: false
        });
    };
    var delVertex = (vid) => {
        if(!vertex.value[vid]) return;
        for(var i in edge.value){
            for(var j in edge.value[i]){
                for(var k in edge.value[i][j]) if(i == vid || j == vid) delEdge(i, j, k);
            }
        }
        vertex.value[vid].el.remove();
        delete vertex.value[vid];
    };
    var moveVertex = (vid, newX, newY) => {
        // @@@@
        var dx, dy;
        for(var i in edge.value){
            for(var j in edge.value[i]){
                for(var k in edge.value[i][j]) {
                    if(i == vid || j == vid) {
                        dx = vertex.value[j].x - vertex.value[i].x;
                        dy = vertex.value[j].y - vertex.value[i].y;
                        gsap.to(edge.value[i][j][k].el, 0.5, {x: dx, y: dy, rotate: Math.atan2(dy, dx) * 180 / Math.PI + "deg", width: "px"});
                    }
                }
            }
        }
        vertex.value[vid].x = newX;
        vertex.value[vid].y = newY;
    };



    var newEdge = (p0, p1, weight, directional = false, color = colorList.random()) => {
        var eid = supfnc.randAlphabet(15);
        var edge = supfnc.createElement("div", {class: (directional ? ["edge", "directional"] : "edge"), style: {backgroundColor: color}});

        if(!edge.value[p0]) edge.value[p0] = {};
        if(!edge.value[p0][p1]) edge.value[p0][p1] = {};
        edge.value[p0][p1][eid] = {weight: weight, el: edge, options: {}};

        graph.value.appendChild(edge);
        edge.config = {eid: eid, from: vertex.value[p0], to: vertex.value[p1]};

        if(!directional){
            var edge2 = newEdge(p1, p0, weight, true, color);
            edge.classList.add("edgeInvisible");
        }

        return edge;
    };
    var delEdge = (p0, p1, eid, directional = false) => {
        if(edge.value[p0]) {
            edge.value[p0]?.[p1]?.[eid].el.remove();
            delete edge.value?.[p0]?.[p1]?.[eid];
        }
        if(!directional) delEdge(p1, p0, eid, true);
    };


    var mountedF = () => {
        graph.value = $el.value.getElementsByClassName("graph")[0];
    }
    onMounted(mountedF);
</script>


<template>
    <div ref="$el">
        <div class="graph">
        </div>
    </div>
</template>

<style lang="scss">
    .graph{
        position: relative;
        width: 100%;
        height: 100%;
    }
    .vertex{
        position: absolute;
        width: 10px;
        height: 10px;
        z-index: 1000;
        border-radius: 50%;
    }
    .edge{
        position: absolute;
        height: 10px;
        z-index: 100;
    }

    .edgeInvisible{
        display: none;
    }

    .edge.directional::before{
        content: '';
    }
    .edge:not(.directional)::before{
        content: '';
    }
    .edge:not(.directional)::after{
        content: '';
    }
</style>