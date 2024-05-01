<script setup>
    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'
    import { supfnc } from '@/js/NSsupportFnc.js'
    import { HTTPreq } from '@/js/NSHTTPreq.js'
    import { search3 } from '@/devComponents/NSsearch.vue'
    import _ from 'lodash'
    import Swal from 'sweetalert2';

    const $el = ref(null);
    const props = defineProps({
        config: Object
    });
    const { config } = toRefs(props);

    const emit = defineEmits(["tableData"]);

    var globalUpdate = ref(0); // for updating data 
    var tablesetting = ref(config.value);

    var toJSON = (arg, option) => {
        try{
            arg = arg.replace(RegExp(option, 'g'),"");
            return JSON.parse(arg.replace(/\&amp;/g, "&").replace(/\&\#39;/g, "\"").replace(/\'/g, "\""));
        }
        catch(e){ console.log(arg, e)
            return {};
        }
    }

    var getV = (obj, tar, def) => {
        try{
            var r = obj[tar];
            return r == undefined ? def : r;
        }
        catch(e){
            console.error(e);
            return def;
        }
    }
    class tableObject{
        constructor({onePageNum: onePageNum = 20, pageBtnShowNum: pageBtnShowNum = 5, getDataConfig: getDataConfig={}, saveDataConfig: saveDataConfig={}, newRowDataMethod: newRowDataMethod=null, getDataTpye: getDataTpye = 0} = {}){
            var _data = [];
            var _dataNum = 0;

            var _onePageNum = typeof onePageNum == "number" ? onePageNum : 20;
            var _nowPage = 1;
            var _maxPage = 1;
            var _getDataTpye = getDataTpye ? 1 : 0; // 1=get one page one time, 0=get all page one time

            var _pageBtnShowNum = typeof pageBtnShowNum == "number" ? pageBtnShowNum : 5;
            var _pageBtnBox = [];
            var _inpageData = [];
            var _getDataConfig = {
                url: "",
                // url: function(nowpage){}
                dataType: "txt",
                method: "GET",
                dataRoute: {
                    data: "data",
                    dataNum: "dataNum"
                },
                parameter: (_nowPage) => {return {page: _nowPage};},
                callback: [],
            };
            var _saveDataConfig = {
                url: "",
                dataType: "txt",
                method: "POST",
                sendData: (data) => {},
                callback: [],
            };
            var _newRowDataMethod = async () => {
                var _html = "";
                var titleKey = tableSetting.value.titleOrder || [];
                var titleValue = titleKey.reduce((a,e) => {a.push(tableSetting.value.titleTrans.getV(e,e)); return a;}, []);
                for(var i in titleKey){
                    _html += `<div><label>${titleValue[i]}</label><input id="${titleKey[i]}" class="swal2-input"></div>`;
                }
                const { value: formValues } = await Swal.fire({
                    title: '修改',
                    html: _html,
                    focusConfirm: false,
                    showCancelButton: true,
                    cancelButtonText: "取消",
                    width: 600,
                    preConfirm: () => {
                        var res = {};
                        for(var i in titleKey){
                            res[titleKey[i]] = document.getElementById(titleKey[i]).value;
                        }
                        var link = res.link.replace(new RegExp("\\\n", "g"), "").split(","), K, V;
                        link.removeE('');
                        res.link = [];
                        for(var i in link){
                            [K, V] = link[i].split(":");
                            res.link.push({txt: K.strip(), url: V.strip()});
                        }
                        return res;
                    }
                });
                return formValues;
            }

            // self data
            this.data = [];
            this.searchRes = [];
            this.nowPage = 1;
            this.maxPage = 1;
            this.pageBtnBox = [];
            this.inpageData = [];
            this.updateFnc = {};
            this.status = [1];

            // init
            
            for(var i in _getDataConfig) if(getDataConfig[i] && _getDataConfig[i].constructor == getDataConfig[i].constructor) _getDataConfig[i] = getDataConfig[i].duplicate();
            for(var i in _getDataConfig.dataRoute) _getDataConfig.dataRoute[i] = _getDataConfig.dataRoute[i].split(".");

            for(var i in _saveDataConfig) if(saveDataConfig[i] && _saveDataConfig[i].constructor == saveDataConfig[i].constructor) _saveDataConfig[i] = saveDataConfig[i].duplicate();
            if(typeof newRowDataMethod == "function") _newRowDataMethod = newRowDataMethod.duplicate();

            // functions
            var _assignData = (target, newData) => {
                while(target.length) target.pop();
                for(var i in newData) target[i] = newData[i];
                target.length = newData.length;
            }

            // ***
            this.updateData = (data, page, force=0, doEmit = true) => {
                if(!Array.isArray(data)) {
                    console.warn(data, "is not Array");
                    return this;
                }
                if(page){
                    var tmpPageIdx;
                    for(var i=0; i<_onePageNum; i++){
                        tmpPageIdx = (page - 1) * _onePageNum + i;
                        if(i >= data.length) break;
                        _data[tmpPageIdx] = data[i];
                    }
                }
                else {
                    _data = data;
                    _dataNum = data.length;
                }
                _assignData(this.data, _data);
        
                (force>0) ? this.selectPage(_nowPage, force) : this.search(searchText.value, force);
                if(doEmit) emit("datachange", _data);
                // console.log(this, this.data, _data);
                return this;
            }

            this.switchRow = (a, b, doEmit = true) => {
                _data.switch(a, b);
                this.updateData(_data, null, -1, doEmit);
            }

            this.moveRow = (from, to, doEmit = true) => {
                _data.moveft(from, to);
                this.updateData(_data, null, -1, doEmit);
            }

            this.deleteRow = (page, row, doEmit = true) => {
                if(!page) return;
                var idx = row == undefined ? page : (page-1) * _onePageNum + row;
                var deleted = _data.splice(idx, 1);
                this.updateData(_data, null, -1, doEmit);
                return deleted;
            }

            this.addRow = (rowData, doEmit = true) => {
                var idx = _data.push(rowData);
                this.updateData(_data, null, -1, doEmit);
                return idx;
            }

            this.search = (text, force=0) => {
                this.searchRes = search3({
                    search_from: _data,
                    search_data: text,
                    search_depth: 1,
                    map_depth: 1,
                });
                this.selectPage(_nowPage, force);
            }

            this.saveData = () => {
                var url, sendData;
                if(typeof _saveDataConfig.url == "string") url = _saveDataConfig.url;
                else if(typeof _saveDataConfig.url == "function") url = _saveDataConfig.url(_nowPage);

                sendData = _saveDataConfig.sendData(this.data);
                new HTTPreq(url, _saveDataConfig.dataType)[_saveDataConfig.method.toLowerCase() + "a"](sendData).then((rcv) => {
                    for(var its in _saveDataConfig.callback){
                        if(typeof _saveDataConfig.callback[its] == "function") _saveDataConfig.callback[its](rcv);
                    }
                });
            }

            this.exportJSON = () => {
                return this.data.duplicate();
            }

            if(_newRowDataMethod.constructor.name == "AsyncFunction"){
                this.newRowData = async () => {
                    var rowData = await _newRowDataMethod()
                    this.addRow(rowData);
                }
            }
            else if(_newRowDataMethod.constructor.name == "Function"){
                this.newRowData = () => {
                    var rowData = _newRowDataMethod();
                    this.addRow(rowData);
                }
            }
            else {
                this.newRowData = () => {
                    console.log("invalid newRowDataMethod, must be Function or AsyncFunction");
                }
            }

            this.selectPage = (page, force=0) => {
                _maxPage = Math.floor((_dataNum - 1) / _onePageNum + 1);
                _nowPage = Math.max(Math.min(page, _maxPage), 1);
        
                while(_pageBtnBox.length) _pageBtnBox.pop();
                var s = Math.max(Math.min(_maxPage - _pageBtnShowNum + 1, Math.floor(_nowPage - _pageBtnShowNum / 2) + 1), 1);
                for(var i=0; i<_pageBtnShowNum; i++) _pageBtnBox.push(i + s);
                _assignData(this.pageBtnBox, _pageBtnBox);

                this.nowPage = _nowPage;
                this.maxPage = _maxPage;
                for(var i in this.updateFnc) if(typeof this.updateFnc[i] == "function") this.updateFnc[i](this);
                
                if((force >= 0) && (_nowPage == 1 || _getDataTpye) && _data[(_nowPage - 1) * _onePageNum] == undefined || force>0) {
                    var T = this, url, sendData, tmp;
                    this.status[0] = 1; // getting data
                    _assignData(T.inpageData, []);

                    sendData = _getDataConfig.parameter(_nowPage);

                    if(typeof _getDataConfig.url == "string") url = _getDataConfig.url;
                    else if(typeof _getDataConfig.url == "function") url = _getDataConfig.url(_nowPage);

                    new HTTPreq(url, _getDataConfig.dataType)[_getDataConfig.method.toLowerCase() + "a"](sendData).then((rcv) => {
                        try{
                            if(rcv.status !== 200) throw("");
                            var res = supfnc.toJSON(rcv.result), tmpData;
                            tmpData = res;
                            for(var its in _getDataConfig.dataRoute.data) if(tmpData[_getDataConfig.dataRoute.data[its]]) tmpData = tmpData[_getDataConfig.dataRoute.data[its]];

                            if(_getDataTpye){
                                tmp = res;
                                for(var its in _getDataConfig.dataRoute.dataNum) if(tmp[_getDataConfig.dataRoute.dataNum[its]]) tmp = tmp[_getDataConfig.dataRoute.dataNum[its]];
                                
                                if(typeof tmp == "number") T.setDataNum(tmp);
                            }
                            else{
                                T.setDataNum(tmpData.length);
                            }
                            
                            if(tmpData.length) {
                                T.status[0] = 0;
                                T.updateData(tmpData, page, 0);
                            }
                            else if(page == T.nowPage) T.status[0] = 2; // empty data
                        }
                        catch(e){
                            console.error(rcv.result, e)
                            T.status[0] = 3; // get data error
                        }

                        for(var its in _getDataConfig.callback){
                            if(typeof _getDataConfig.callback[its] == "function") _getDataConfig.callback[its](rcv);
                        }
                    });
                }
                else{
                    while(_inpageData.length) _inpageData.pop();
                    while(this.inpageData.length) this.inpageData.pop();
                    nextTick(()=>{
                        var tmpPageIdx;
                        for(var i=0; i<_onePageNum; i++){
                            tmpPageIdx = (_nowPage - 1) * _onePageNum + i;
                            if(tmpPageIdx >= this.searchRes.length) break;
                            // _inpageData.push(this.searchRes[tmpPageIdx]);
                            _inpageData.push(_data[this.searchRes[tmpPageIdx]]);
                        }
                        _assignData(this.inpageData, _inpageData);

                        if(_inpageData.length) this.status[0] = 0; // normal status
                        else this.status[0] = 2; // empty data
                    });
                }
                return this;
            }

            this.setDataNum = (dataNum) => {
                _dataNum = dataNum || _dataNum;
                _maxPage = Math.floor((_dataNum - 1) / _onePageNum + 1);
                _data.length = _dataNum;
                this.maxPage = _maxPage;
                return this;
            }
        
            this.setOnePageNum = (onePageNum) => {
                _onePageNum = onePageNum || _onePageNum;
                this.selectPage(this.nowPage);
                return this;
            }
        
            this.getOnePageNum = () => {
                return _onePageNum;
            }
        
            this.setPageBtnShowNum = (pageBtnShowNum) => {
                _pageBtnShowNum = pageBtnShowNum || _pageBtnShowNum;
                return this;
            }

            this.setParameter = (fnc) => {
                if(typeof fnc == "function") _getDataConfig.parameter = fnc;
            }

            this.bindProxy = (instance) => {
                for(var i in instance) this[i] = instance[i];
                // this.data = instance.data;
                // this.inpageData = instance.inpageData;
                // this.nowPage = instance.nowPage;
                // this.maxPage = instance.maxPage;
                return this;
            }

            // usage (this.tabletest = new tableObject()).bindProxy(this.tabletest);
        }

        static Init = function(){
            var _onePageNum = 20;
            var _getDataTpye = 0;
            var _pageBtnShowNum = 5;
            var _getDataConfig = {
                url: "",
                dataType: "txt",
                method: "GET",
                dataRoute: {
                    data: "data",
                    dataNum: "dataNum"
                },
                parameter: (_nowPage) => {return {page: _nowPage};},
                callback: []
            };

            return {
                onePageNum:_onePageNum,
                getDataTpye:_getDataTpye,
                pageBtnShowNum:_pageBtnShowNum,
                getDataConfig:_getDataConfig,
            }
        }
    }

    var pagedtableDataInit = function(){
        var tableSetting = tableObject.Init();
        var componentInit = {
            tableClass:{
                topMenu: "",
                searchForm: "",
                searchFormText: "",
                searchFormInput: "",
                newRow: "",
                saveData: "",
                pageBar: "pagination my-2",
                pageListBtn: "page-item",
                pageListBtnText: "btn page-link",
                pageBtnNowPage: "page-item active",
                pageSelect: "form-select d-inline-block",
                dataLengthText: "mx-2 align-self-center",
                dataOrderColumnTr: "",
                dataOrderColumnTd: "",
                table: "table my-2",
                thead: "",
                tbody: "",
                theadTr: "",
                tbodyTr: "",
                th: "",
                td: "",
                
                loading: "",
                loadFailed: "",
                noData: "",
                dataLost: "",
            },
            tableStyle:{
                topMenu: "",
                searchForm: "",
                searchFormText: "",
                searchFormInput: "",
                newRow: "",
                saveData: "",
                pageBar: "",
                pageListBtn: "",
                pageListBtnText: "",
                pageBtnNowPage: "",
                pageSelect: "width: unset;",
                dataLengthText: "",
                dataOrderColumnTr: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",
                dataOrderColumnTd: "",
                table: "",
                thead: "",
                tbody: "",
                theadTr: "",
                tbodyTr: "",
                th: "",
                td: "",

                loading: "",
                loadFailed: "",
                noData: "",
                dataLost: "",
            },
            tableText:{
                dataIndexTitle: "資料序",
                loading: "載入中",
                loadFailed: "載入失敗",
                noData: "無資料",
                dataLost: "資料缺失",
            },
            colunmWidth: [],
            titleOrder: [], // required
            titleTrans: {},
            titleSpecial: {
                // titleName: {
                //     html: "",
                //     or use function
                //     html: function(rowData){
                //         return `<p class="btn btn-outline-secondary" @click="eventName">` + rowData.b + rowData.c + `</p>`;
                //     },
                //     eventName: function(event, rowData){}
                // }
            },
            enableSort: false,
            enablePageBtns: false,
            showDataIndex: false,
            useSearchForm: false,
            enableNewRow: false,
        };
        return Object.assign({}, tableSetting, componentInit);
    }
    
    var tableSetting = ref(pagedtableDataInit());
    // var tableSetting = {
    //     tableClass:{
    //         table: "table my-2",
    //         searchForm: "",
    //         pageBar: "pagination",
    //         pageListBtn: "page-item",
    //         pageListBtnText: "btn page-link",
    //         pageBtnNowPage: "page-item active",
    //         pageSelect: "form-select d-inline-block",
    //         dataLengthText: "mx-2",
    //         dataOrderColumnTr: "",
    //         dataOrderColumnTd: "",
    //         thead: "",
    //         tbody: "",
    //         theadTr: "",
    //         tbodyTr: "",
    //         th: "",
    //         td: "",
    
    //         loading: "",
    //         loadFailed: "",
    //         noData: "",
    //         dataLost: "",
    //     },
    //     tableStyle:{
    //         table: "",
    //         searchForm: "",
    //         pageBar: "",
    //         pageListBtn: "",
    //         pageListBtnText: "",
    //         pageBtnNowPage: "",
    //         pageSelect: "width: unset;",
    //         dataLengthText: "",
    //         dataOrderColumnTr: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap;",
    //         dataOrderColumnTd: "",
    //         thead: "",
    //         tbody: "",
    //         theadTr: "",
    //         tbodyTr: "",
    //         th: "",
    //         td: "",

    //         loading: "",
    //         loadFailed: "",
    //         noData: "",
    //         dataLost: "",
    //     },
    //     tableText:{
    //         // accept string or function
    //         // use function
    //         // dataLost: (rowData, rowIdx, nowPage) => {
    //         //     console.log(rowData, rowIdx, nowPage)
    //         //     return "資料" + Math.random() + "缺失";
    //         // }
    //         dataIndexTitle: "資料序",
    //         loading: "載入中",
    //         loadFailed: "載入失敗",
    //         noData: "無資料",
    //         dataLost: "資料缺失",
    //     },
    //     colunmWidth: [],
    //     titleOrder: [], // required
    //     titleTrans: {},
    //     titleSpecial: {
    //         // titleName: {
    //         //     html: "",
    //         //     or use function
    //         //     html: function(rowData){
    //         //         return `<p class="btn btn-outline-secondary" @click="eventName">` + rowData.b + rowData.c + `</p>`;
    //         //     },
    //         //     eventName: function(event, rowData){}
    //         // }
    //     },
    //     enableSort: false,
    //     enablePageBtns: false,
    //     showDataIndex: false,
    //     useSearchForm: false,
    //     enableNewRow: false,

    //     onePageNum: 20,
    //     getDataTpye: 0,
    //     pageBtnShowNum: 5,
    //     getDataConfig:{
    //         url: "",
    //         dataType: "txt",
    //         method: "GET",
    //         dataRoute: { // use "a.b.c" to access res.a.b.c
    //             data: "data", // received data
    //             dataNum: "dataNum", // received data total length
    //         },
    //         parameter: () => {return [{page: "page"}];},
    //         callback: [(RES)=>{}],
    //     },
    // };
    var tableData = ref(new tableObject(tablesetting.value));
    var dataStatus = ref(0);
    var dataStatusOld = ref(0);
    var pageNow = ref(0);
    var pageOld = ref(0);
    var searchText = ref("");

    var initSetting = function(selfData, data){
        var selfisArray = selfData.constructor == Array;
        for(var i in (selfisArray ? data: selfData)) {
            if(selfisArray) {
                if(typeof data[i] != "function") selfData[i] = data[i]; // (data[i] || "").duplicate();
            }
            else if(data[i] && data[i].constructor == selfData[i].constructor){
                if([Object, Array].includes(selfData[i].constructor)){
                    initSetting(selfData[i], data[i]);
                }
                else{
                    selfData[i] = data[i];
                }
            }
            else if(typeof selfData[i] == "string" && selfData.constructor == Object){
                if(typeof data[i] == "function"){
                    selfData[i] = data[i];
                }
            }
        }
    };
    var getProperty = function(propertyName, tagName, rowData, rowIdx, colIdx){
        var rtn = "", res;
        if(["loading", "loadFailed", "noData", "dataLost"].includes(tagName)){
            res = [tableSetting.value[propertyName][tagName], tableSetting.value[propertyName].td];
        }
        else if(["dataOrderColumnTr", "dataOrderColumnTd"].includes(tagName)){
            res = [tableSetting.value[propertyName][tagName], tableSetting.value[propertyName][tagName.slice(-2)]];
        }
        else res = [tableSetting.value[propertyName][tagName]];
        for(var i in res){
            if(typeof res[i] == "string") rtn += res[i];
            else if(typeof res[i] == "function") rtn += res[i](rowData, tableData.value.nowPage, rowIdx, colIdx);
            else if(Array.isArray(res[i])) rtn += res[i][colIdx];
            else if(Object.isDict(res[i])) rtn += res[i][tableSetting.value.titleOrder[colIdx]];
            rtn += " ";
        }
        return rtn;
    };

    // no passed data
    //      table tbody thead theadTr pageListBtn pageBtnNowPage pageSelect dataLengthText

    // row, rowIdx
    //      tbodyTr td loadin, loadFailed noData dataLost
    var getClass = function(tagName, rowData, rowIdx, colIdx){
        return getProperty("tableClass", tagName, rowData, rowIdx, colIdx);
    };
    var getStyle = function(tagName, rowData, rowIdx, colIdx){
        return getProperty("tableStyle", tagName, rowData, rowIdx, colIdx);
    };
    var getText = function(tagName, rowData, rowIdx){
        var target = tableSetting.value.tableText[tagName];
        return (typeof target == "function" ? target(rowData, rowIdx, tableData.value.nowPage) : target) + " ";
    };
    var bindSpecialEventListener = function(RES, PAGE){
        var idx, tr;
        for(let title in tableSetting.value.titleSpecial){ // loop all titleSpecial
            idx = tableSetting.value.titleOrder.indexOf(title);
            if(idx >= 0){
                tr = [...$el.value?.getElementsByTagName("tr")||[]];
                for(let i in tr){ // loop titleSpecial column in all row
                    if(!tr[i].children[idx] || i=='0') continue;
                    supfnc.bindEvent(tr[i].children[idx].children[0], tableSetting.value.titleSpecial[title], RES[i-1], PAGE, i-1);
                }
            }
        }
    };
    var refreshData = function(){
        tableData.value.updateData([], null, 1);
    };
    
    var mountedF = () => {
        var tmp;
        initSetting(tableSetting.value, tablesetting.value);
        for(var i in tableSetting.value.titleOrder) tableSetting.value.titleTrans[tableSetting.value.titleOrder[i]] = tablesetting.value.titleTrans[tableSetting.value.titleOrder[i]];
        tableSetting.value.titleSpecial = tablesetting.value.titleSpecial;
        for(var i in tableSetting.value.titleSpecial) {
            if(typeof tableSetting.value.titleSpecial[i].html != "function") {
                tmp = tableSetting.value.titleSpecial[i].html;
                tableSetting.value.titleSpecial[i].html = ()=>{return tmp || "";}
            }
        }
        tableSetting.value.getDataConfig.callback = [];
        for(var i in tablesetting.value.getDataConfig.callback){
            tableSetting.value.getDataConfig.callback.push(
                (RES) => {
                    tablesetting.value.getDataConfig.callback[i]($el.value, RES);
                }
            )
        }

        // (tableData = ref(new tableObject(tableSetting.value)));
        tableData.value.bindProxy(tableData.value);
        tableSetting.value.enableSort = !tableSetting.value.getDataTpye;
        tableSetting.value.useSearchForm = !tableSetting.value.getDataTpye;
        tableData.value.selectPage(1);
        tableData.value.refreshData = refreshData;
        if(typeof tablesetting.value.onMounted == "function") tablesetting.value.onMounted($el.value);
        emit("load", tableData.value);
    };
    var updatedF = () => {
        pageNow.value = tableData.value.nowPage;
        dataStatus.value = tableData.value.status[0]; // @@@@
        if(dataStatus.value == 0 && dataStatusOld != dataStatus || pageOld.value != pageNow.value) bindSpecialEventListener(tableData.value.inpageData, pageNow.value);
        pageOld.value = pageNow.value;
        dataStatusOld.value = dataStatus.value;
    };

    onMounted(mountedF);
    onUpdated(updatedF);
    watch(() => tableData.value.nowPage, function(){
        tableData.value.selectPage(tableData.value.nowPage);
    });
    watch(() => searchText.value, function(){
        tableData.value.search(searchText.value);
    });
</script>

<template>
    <div ref="$el">
        <div :class="getClass('topMenu')" :style="getStyle('topMenu')">
            <slot v-if="tableSetting.useSearchForm" name="customSearchForm" :bind="{ value: searchText }" :on="{ input: value => searchText=value.target.value }">
                <div :class="getClass('searchForm')" :style="getStyle('searchForm')">
                    <span :class="getClass('searchFormText')" :style="getStyle('searchFormText')">@搜尋</span>
                    <input :class="getClass('searchFormInput')" :style="getStyle('searchFormInput')" v-model="searchText"/>
                </div>
            </slot>
            <slot v-if="tableSetting.enableNewRow" name="customNewRow">
                <button :class="getClass('newRow')" :style="getStyle('newRow')" @click="tableData.newRowData()">新增資料</button>
            </slot>
            <slot v-if="tableSetting.enableNewRow" name="customSaveData">
                <button :class="getClass('saveData')" :style="getStyle('saveData')" @click="tableData.saveData()">儲存</button>
            </slot>
        </div>
        
        <template v-if="tableData.maxPage">
        <ul v-if="tableSetting.enablePageBtns" :class="getClass('pageBar')" :style="getStyle('pageBar')">
            <li :class="getClass('pageListBtn')" :style="getStyle('pageListBtn')" @click="tableData.selectPage(1)">
                <span :class="getClass('pageListBtnText')" :style="getStyle('pageListBtnText')"><i class="fas fa-angle-double-left"></i></span>
            </li>
            <li :class="getClass('pageListBtn')" :style="getStyle('pageListBtn')" @click="tableData.selectPage(tableData.nowPage-1)">
                <span :class="getClass('pageListBtnText')" :style="getStyle('pageListBtnText')"><i class="fas fa-angle-left"></i></span>
            </li>
            <li :class="tableData.nowPage==i ? getClass('pageBtnNowPage') : getClass('pageListBtn')" :style="tableData.nowPage==i?getStyle('pageBtnNowPage'):getStyle('pageListBtn')" @click="tableData.selectPage(i)" v-for="i in tableData.pageBtnBox"> 
                <span :class="getClass('pageListBtnText')" :style="getStyle('pageListBtnText')">{{i}}</span>
            </li>
            <li :class="getClass('pageListBtn')" :style="getStyle('pageListBtn')" @click="tableData.selectPage(tableData.nowPage+1)">
                <span :class="getClass('pageListBtnText')" :style="getStyle('pageListBtnText')"><i class="fas fa-angle-right"></i></span>
            </li>
            <li :class="getClass('pageListBtn')" :style="getStyle('pageListBtn')" @click="tableData.selectPage(tableData.maxPage)">
                <span :class="getClass('pageListBtnText')" :style="getStyle('pageListBtnText')"><i class="fas fa-angle-double-right"></i></span>
            </li>
        </ul>
        <div v-else :class="getClass('pageBar')" :style="getStyle('pageBar')">
            <select :class="getClass('pageSelect')" :style="getStyle('pageSelect')" role="button" v-model="tableData.nowPage">
                <option v-for="i in tableData.maxPage" :value="i">{{i}}</option>
            </select>
            <span :class="getClass('dataLengthText')" :style="getStyle('dataLengthText')">共 {{tableData.searchRes.length}} 筆</span>
        </div>
        </template>

        <table class="NSeztable" :class="getClass('table')" :style="getStyle('table')">
            <thead :class="getClass('thead')" :style="getStyle('thead')">
                <tr :class="getClass('theadTr')" :style="getStyle('theadTr')">
                    <th :class="getClass('dataOrderColumnTr')" :style="getStyle('dataOrderColumnTr')" v-if="tableSetting.showDataIndex">{{ tableSetting.tableText.dataIndexTitle }}</th>
                    <th :class="getClass('th', title, titleIdx)" :style="getStyle('th', title, titleIdx)" :width="tableSetting.colunmWidth[titleIdx]" v-for="(title, titleIdx) in tableSetting.titleOrder">{{ getV(tableSetting.titleTrans, title, title)}}</th>
                </tr>
            </thead>
            <tbody :class="getClass('tbody')" :style="getStyle('tbodyTr')">
                <!-- Normal -->
                <tr :class="getClass('tbodyTr', row, rowIdx)" :style="getStyle('tbodyTr', row, rowIdx)" v-for="(row, rowIdx) in tableData.inpageData">
                    <td :class="getClass('dataOrderColumnTd', row, rowIdx, -1)" :style="getStyle('dataOrderColumnTd', row, rowIdx)" v-if="tableSetting.showDataIndex">{{ (tableData.nowPage - 1) * tableData.getOnePageNum() + rowIdx + 1 }}</td>
                    <td :class="getClass('td', row, rowIdx)" :style="getStyle('td', row, rowIdx, colIdx)" v-for="(title, colIdx) in tableSetting.titleOrder" v-if="row" v-html="title in tableSetting.titleSpecial ? tableSetting.titleSpecial[title].html(row) : getV(row, title, '--')"></td>

                    <!-- Data Lost -->
                    <td :class="getClass('dataLost', row, rowIdx)" :style="getStyle('dataLost', row, rowIdx)" class="text-center" :colspan="tableSetting.titleOrder.length + Boolean(tableSetting.showDataIndex)" v-if="!row">{{ getText('dataLost', row, rowIdx) }}</td>
                </tr>

                <!-- Loading -->
                <tr :class="getClass('tbodyTr')" :style="getStyle('tbodyTr')" v-if="tableData.status[0] == 1">
                    <td :class="getClass('loading')" :style="getStyle('loading')" class="text-center" :colspan="tableSetting.titleOrder.length + Boolean(tableSetting.showDataIndex)">
                    {{ getText('loading') }}
                    </td>
                </tr>

                <!-- No Data -->
                <tr :class="getClass('tbodyTr')" :style="getStyle('tbodyTr')" v-if="tableData.status[0] == 2">
                    <td :class="getClass('noData')" :style="getStyle('noData')" class="text-center" :colspan="tableSetting.titleOrder.length + Boolean(tableSetting.showDataIndex)">
                        {{ getText('noData') }}<i class="btn mx-2 py-0 fas fa-redo" @click="tableData.selectPage(tableData.nowPage)"></i>
                    </td>
                </tr>

                <!-- Load Failed -->
                <tr :class="getClass('tbodyTr')" :style="getStyle('tbodyTr')" v-else-if="tableData.status[0] == 3">
                    <td :class="getClass('loadFailed')" :style="getStyle('loadFailed')" class="text-center" :colspan="tableSetting.titleOrder.length + Boolean(tableSetting.showDataIndex)">
                        {{ getText('loadFailed') }}<i class="btn mx-2 py-0 fas fa-redo" @click="tableData.selectPage(tableData.nowPage)"></i>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped lang="scss">

</style>
