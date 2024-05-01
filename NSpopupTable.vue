<script setup>
    import { ref, toRefs, onMounted, onUpdated, watch, nextTick, onUnmounted } from 'vue'
    import { Draggable, gsap, Back, Quad } from 'gsap/all'
    import { supfnc } from '@/js/NSsupportFnc.js'
    import _ from 'lodash'

    gsap.registerPlugin(Draggable)

    const $el = ref(null);
    const props = defineProps({
        data: Array,
        config: Object
    });
    var { data, config } = toRefs(props);
    // data: [{html:"", events:{eventName: func }, data: any}, or ""]
    var configDefault = {
        gutter: 10,
        itemWidth: 0, // 0 = every item's width would different
        itemHeight: 60, // required
        arranged: config.value.itemWidth ? 1 : (config.value.arranged || 0),
        popInDelay: 0.08,
        popInDuration: 0.4,
        popOutDuration: 0.25,
    }

    var itemList = ref([]);
    var shadow1 = ref("0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)");
    var shadow2 = ref("0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)");

    var getConfigValue = (name, def) => {
        return config.value[name] || configDefault[name] || def;
    };

    var removeItem = (itemIdx, removeHtmlElement = 1) => {
        let item = $el.value?.getElementsByClassName("itemListEl")[0].getElementsByClassName("popupTableItem")[itemIdx];
        // console.log(item)
        if(item) {
            item.config.removed = 1;
            itemList.value.splice(itemIdx, 1);
            
            if(removeHtmlElement) gsap.fromTo(item, getConfigValue("popOutDuration", 0.25), {scale: 1}, {scale: 0.2, ease: Back.easeIn.config(3), onComplete:()=>{item.remove();}});
            // else layoutInvalidated();
        }
    };

    var createItem = (itemIdx, ctx, insertAt) => {
        var itemListEl = $el.value.getElementsByClassName("itemListEl")[0];

        itemList.value.insert(ctx, itemIdx);

        if(typeof ctx == "string" || typeof ctx == "number"){
            var element = supfnc.createElement("div", {class:["popupTableItem", "popupTableDefault"]});
            element.innerHTML = ctx;
        }
        else if(Object.isDict(ctx)){
            if(!ctx.class) ctx.class = ["popupTableDefault"];
            var element = supfnc.createElement("div", ctx);
            element.innerHTML = ctx.html || ctx.txt || "";
            element.classList.add("popupTableItem");
            
            supfnc.bindEvent(element, config.value.events, element, ctx.data);
        }

        itemListEl.appendChild(element);

        var itemConfig = {
            x: 0,
            y: 0,
            col: 0,
            row: 0,
            element: element,
            width: getConfigValue("itemWidth", element.offsetWidth),
            height: getConfigValue("itemHeight", 60),
            isDragging: false,
            isNewItem: true,
        };
        element.config = itemConfig;
        gsap.to(element, 0, {rotateY: 90});

        insertAt == undefined ? 0 : changePosition(itemList.value.length - 1, insertAt, 1);

        if(getConfigValue("draggable", 0)){
            function onPress() {
                gsap.to(element, 0.2, {
                    autoAlpha: 0.75,
                    boxShadow: shadow2.value,
                    scale: 0.95,
                    zIndex: "+=1000"
                });
            }
            function onRelease() {
                gsap.to(element, 0.2, {
                    autoAlpha: 1,
                    boxShadow: shadow1.value,
                    scale: 1,
                    x: itemConfig.x,
                    y: itemConfig.y,
                    zIndex: ++zIndex.value
                });

                itemConfig.isDragging = false;
            }

            Draggable.create(element, {
                onPress: onPress,
                onRelease: onRelease,
                zIndexBoost: false
            });
        }
    }

    var changePosition = function(from, to, noEditList) {
        var $itemsNode = [...$el.value?.getElementsByClassName("popupTableItem")];
        if(from < to) to++;
        
        for(var i=0; i<$itemsNode.length; i++) {
            if($itemsNode[i].config.removed){
                $itemsNode.splice(i, 1);
                i--;
            }
        }

        $itemsNode[from].parentElement.insertBefore($itemsNode[from], $itemsNode[to]);
        
        if(!noEditList){
            itemList.value.moveft(from, to);
        }
        // layoutInvalidated();
    };

    var layoutInvalidated = () => {
        var itemListEl = $el.value.getElementsByClassName("itemListEl")[0];
        var itemElements = [...itemListEl.children];
        var gutter = getConfigValue("gutter", 10);
        var itemHeight = getConfigValue("itemHeight", 60);
        var isFixWidth = getConfigValue("itemWidth", 0);
        var boxWidth = itemListEl.getBoundingClientRect().width, eachLineWidth = [0], eachLineItemsCount = [0], eachLineItemWidthCost = [0];
        var lineIter = 0, x = 0, y = 0, col = 0, row = 0, widthTmp;
        var delay;

        for(var i=0; i<itemElements.length; i++) {
            if(itemElements[i].config.removed){
                itemElements.splice(i, 1);
                i--;
            }
        }

        delay = 5 * getConfigValue("popInDelay", 0.08) / itemElements.length + 0.04;

        for(var i in itemElements){
            widthTmp = getConfigValue("itemWidth", itemElements[i].offsetWidth);

            if(eachLineWidth[lineIter] + widthTmp > boxWidth + eachLineItemsCount[lineIter] * gutter / 2) {
                lineIter++;
                eachLineWidth[lineIter] = eachLineItemsCount[lineIter] = eachLineItemWidthCost[lineIter] = 0;
            }
            eachLineWidth[lineIter] += widthTmp + gutter;
            eachLineItemWidthCost[lineIter] += widthTmp;
            eachLineItemsCount[lineIter]++;
        }
        if(lineIter && isFixWidth){
            gutter = parseInt((boxWidth - eachLineItemWidthCost[0]) / (eachLineItemsCount[0] - 1));
        }

        for(let i in itemList.value){
            var attr = {
                x: x,
                y: y,
                col: col,
                row: row,
                element: itemElements[i],
                width: getConfigValue("itemWidth", itemElements[i].offsetWidth),
                height: itemHeight,
            };
            for(var j in attr) itemElements[i].config[j] = attr[j];
            itemElements[i].style.height = attr.height + "px";
            itemElements[i].style.width = attr.width + "px";
            
            x += getConfigValue("itemWidth", itemElements[i].offsetWidth) + (row == lineIter ? gutter : parseInt((boxWidth - eachLineItemWidthCost[row]) / (eachLineItemsCount[row] - 1)));
            col++;
            if(col >= eachLineItemsCount[row]){
                x = col = 0;
                y += itemHeight + gutter;
                row++;
            }
        }

        for(let i in itemElements){
            if(itemElements[i].config.isNewItem) {
                itemElements[i].config.isNewItem = false;
                gsap.to(itemElements[i], 0, {rotateY: 0, x: itemElements[i].config.x, y: itemElements[i].config.y, delay: 0.1 + i * delay});
                gsap.fromTo(itemElements[i], getConfigValue("popIbDuration", 0.4), {scale: 0.2}, {scale: 1, ease: Back.easeOut.config(3), delay: 0.1 + i * delay});
            }
            else gsap.to(itemElements[i], getConfigValue("popIbDuration", 0.4), {x: itemElements[i].config.x, y: itemElements[i].config.y, ease: Quad.easeInOut});
        }
        itemListEl.style.height = (lineIter + 1) * (itemHeight + gutter) + "px";
    }

    var mountedF = () => {
        nextTick(()=>{
            // resize();
            data.value.forEach((e, i) => {createItem(i, e)});
            layoutInvalidated();
        });
    }

    onMounted(mountedF);


    var detectDataDiff = ref(0), diffInterval = ref(0);
    setInterval(() => {
        if(!_.isEqual(itemList.value, data.value)) detectDataDiff.value++;
    }, 100);

    onUnmounted(()=>{
        clearInterval(diffInterval.value);
    });

    watch(() => detectDataDiff.value, function(){
        var fromTo = supfnc.arrayFromToB(itemList.value, data.value);

        console.log(fromTo);
        var $itemsNode = [...$el.value?.getElementsByClassName("popupTableItem")];
        for(let i in fromTo.delIdx){
            removeItem(fromTo.delIdx[i]);
            $itemsNode.splice(fromTo.delIdx[i], 1);
        }

        for(var i in fromTo.movIdx){
            var from = fromTo.movIdx[i][0], to = fromTo.movIdx[i][1];
            itemList.value.switch(from, to);
            $itemsNode[from].parentElement.insertBefore($itemsNode[from], $itemsNode[to].nextElementSibling);
            $itemsNode[from].parentElement.insertBefore($itemsNode[to], $itemsNode[from+1]);
            $itemsNode.switch(from, to);
        }

        for(let i in fromTo.addIdx){
            createItem(fromTo.addIdx[i], fromTo.add[i], fromTo.addIdx[i]);
        }

        layoutInvalidated();
    }, {deep: true});
    
</script>

<template>
    <div ref="$el">
        <div class="itemListEl"></div>
    </div>
</template>

<style lang="scss">
.itemListEl{
    position: relative !important;
    width: 100%;
}
.popupTableItem{
    position: absolute !important;
}
.popupTableDefault{
    border-radius: 20%;
    border-style: solid;
    border-color: limegreen;
    border-width: .2em;
    margin: auto;
    padding: 5px;
    &:before{
        content: "";
        position: absolute;
        width: 101%;
        height: 101%;
        top: 0;
        left: 0;
        border-radius: 16%;
        border-style: solid;
        border-color: lightgreen;
        border-width: .2em;
        z-index: -1;
    }
}

</style>