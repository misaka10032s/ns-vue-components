<script setup>
    import { ref, toRefs, onMounted, onUpdated, onBeforeUpdate, onUnmounted, watch, nextTick, defineAsyncComponent, computed } from 'vue'

    const $el = ref(null);
    const props = defineProps({
        parent: Object,
        passeddata: Object,
        nbfrom: String,
    });
    var { parent, passeddata, nbfrom } = toRefs(props);

    var passedData = ref(passeddata.value);
    var customClass = ref(passeddata.value.customclass);
    var tableData = ref(passeddata.value.tabledata); // [{item:{language:[] or ''}}]
    var titleOrder = ref(passeddata.value.titleorder);
    var textTrans = ref(passeddata.value.texttrans);
    var Languages = ref(passeddata.value.languages);
    var dataOption = ref(passeddata.value.dataoption);
    var searchOption = ref(passeddata.value.searchoption);
    var sortOption = ref(passeddata.value.sortoption);
    var pageOption = ref(passeddata.value.pageoption);
    //------------------------------------
    var all_data_keys = ref([]);
    var search_data = ref('');
    var additional_search_data = ref({});
    var sortby = ref('');
    var now_page = ref(1);
    var max_page = ref(0);
    var page_tag = ref([]);
    var itemnum_perpage = ref(10);
    var items_in_page = ref([]);
    var items_ISselected = ref({});
    var ISselect_pageALL = ref([]);
    var ISselect_filteredALL = ref(0);
    var ISselect_realALL = ref(0);
    var filter_list = ref([]);
    var tableDataLength = ref(0);
    var filteredLength = ref(0);
    var now_language = ref('');
    var actions = ref([]);
    //------------------------------------
    var default_data = ref({
        customClass: {
            box: '',
            menu_trigger: 'btn btn-outline-secondary',
            menu_btn: 'btn btn-sm',
            menu_btn_trigger0: 'btn-outline-secondary',
            menu_btn_trigger1: 'btn-secondary',
            menu_btnWarning: 'btn btn-sm',
            menu_btnWarning_trigger0: 'btn-outline-danger',
            menu_btnWarning_trigger1: 'btn-danger',
            search_input: 'form-control',
            //------------------------------------
            table: 'table table-sm',
            thead: '',
            tbody: '',
            trh: '',
            trb: '',
            tr: 'align-middle',
            th: '',
            td: '',
            //------------------------------------
            page_group: 'd-grid justify-content-between mb-3',
            set_page_num: 'setpagenum form-select btn-secondary w-auto d-inline',
            page_info: 'flex-grow-1 mb-2',
            page_select: 'btn-group',
            page_select_btn: 'btn',
            page_select_trigger0: 'btn-outline-secondary',
            page_select_trigger1: 'btn-secondary',
        },
        tableData: [],
        textTrans: {},
        dataOption:{enable_drag: true, enable_edit: true, enable_language: false, enable_tools: true, enable_select: true, enable_newdata: true, enable_sort: true},
        searchOption: {enable_search:1, trans:{}, exclude:{'_IDX':1, 'ISselected':1, 'editing':1, '_UID':1}, additional: {}},
        sortOption: [],
        pageOption: {enable_page:1, max_show: 5, perpagelist: [10,20,50], top: 1, bottom: 1, scroolheight: 600},
        //enable_page
        // 0 全展開
        // 1 使用頁籤
        // 2 使用滾輪
    });
    //------------------------------------
    var drop_box = ref({
        IDX: '',
        tmp: 0,
    });
    var enable_drag = ref(false);
    var enable_edit = ref(false);
    var enable_sort = ref(false);
    var editing_num = ref(0);
    var enable_language = ref(false);
    var c_UID = ref('');
    var tableHeight = ref('');
    var editing_box = ref({});
    var now_over = ref(-2);
    var search_dt = ref(0);
    var page_elevator = ref(1);
    var new_item_idx = ref(0);

    // methods
    var whenUpdate = function(arg){
        // console.log(passeddata.value, passedData.value)
        if(arg) c_UID.value = passeddata.value.c_UID.value;

        if(Object.isDict(passeddata.value)) {if(arg) passedData.value = passeddata.value;}
        else if(!Object.isDict(passedData.value)) passedData.value = {};

        if(Object.isDict(passedData.value.customclass)) {if(arg) customClass.value = passedData.value.customclass;}
        else if(!Object.isDict(customClass)) customClass.value = default_data.value.customClass.duplicate();

        if(Array.isArray(passedData.value.tabledata)) {if(arg) for(var i in passedData.value.tabledata)tableData.value[i] = passedData.value.tabledata[i];}
        else if(!Array.isArray(tableData.value)) tableData.value = default_data.value.tableData.duplicate();

        if(Array.isArray(passedData.value.titleorder)) {if(arg) all_data_keys.value = titleOrder.value = passedData.value.titleorder;}
        else if(!Array.isArray(titleOrder.value) || !titleOrder.value.length) titleOrder.value = Object.keys(tableData.value[0] || {}).filter(function(v){return !((Object.keys(passedData.value.searchoption.exclude || {'_IDX':1, 'ISselected':1, 'editing':1, '_UID':1})).includes(v));});

        if(Object.isDict(passedData.value.texttrans)) {if(arg) textTrans.value = passedData.value.texttrans;}
        else if(!Object.isDict(textTrans.value)) textTrans.value = default_data.value.textTrans.duplicate();

        if(Array.isArray(passedData.value.languages)) {if(arg) Languages.value = passedData.value.languages;}
        else if(!Array.isArray(Languages.value)) Languages.value = Object.keys(textTrans.value);

        if(Object.isDict(passedData.value.dataoption)) {if(arg) dataOption.value = passedData.value.dataoption;}
        else if(!Object.isDict(dataOption.value)) dataOption.value = default_data.value.dataOption.duplicate();

        if(Object.isDict(passedData.value.searchoption)) {if(arg) searchOption.value = passedData.value.searchoption;}
        else if(!Object.isDict(searchOption.value)) searchOption.value = default_data.value.searchOption.duplicate();

        if(Array.isArray(passedData.value.sortoption)) {if(arg) sortOption.value = passedData.value.sortoption;}
        else if(!Array.isArray(sortOption.value)) sortOption.value = Object.keys(tableData.value[0] || []);

        if(Object.isDict(passedData.value.pageoption)) {if(arg) pageOption.value = passedData.value.pageoption;}
        else if(!Object.isDict(pageOption.value)) pageOption.value = default_data.value.pageOption.duplicate();

        /*****************************************************************************************/
        var tmpLang = Object.keys(textTrans.value);
        for(var i in tmpLang){
            if(!(tmpLang[i] in Languages.value))Languages.value.push(tmpLang[i]);
        }

        for(var i in Languages.value){
            if(!(Languages.value[i] in textTrans.value)) textTrans.value[Languages.value[i]] = {};
        }
        
        if(enable_language.value && !Languages.value.includes(now_language.value)) now_language.value = Languages.value[0];
        
        for(var i in default_data.value.customClass){
            if(customClass.value[i] == undefined || ['object', 'function'].includes(typeof customClass.value[i])){
                customClass.value[i] = default_data.value.customClass[i].duplicate();
            }
        }
        
        for(var i in default_data.value.dataOption){
            if(dataOption.value[i] == undefined || ['object', 'function'].includes(typeof dataOption.value[i])){
                dataOption.value[i] = default_data.value.dataOption[i].duplicate();
            }
        }
        
        for(var i in default_data.value.searchOption){
            if(searchOption.value[i] == undefined || typeof searchOption.value[i] == 'function'){
                searchOption.value[i] = default_data.value.searchOption[i].duplicate();
            }
        }
        
        for(var i in default_data.value.searchOption.exclude){
            if(searchOption.value.exclude[i] == undefined){
                searchOption.value.exclude[i] = default_data.value.searchOption.exclude[i].duplicate();
            }
        }

        for(var i in default_data.value.pageOption){
            if(pageOption.value[i] == undefined || Array.isArray(pageOption.value[i]) != Array.isArray(default_data.value.pageOption[i])){
                pageOption.value[i] = default_data.value.pageOption[i].duplicate();
            }
        }
        tableDataLength.value = tableData.value.length;
    };
    var update_items_perpage = function(option){// binary 4(check select) 2(set index) 1(set max page)
        var ST, ED, L2 = 0, isALL = 1;
        page_elevator = now_page.value;
        if(pageOption.value.enable_page == 1){
            ST = (now_page.value-1)*itemnum_perpage.value;
            ED = Math.min(now_page.value*itemnum_perpage.value, filter_list.value.length);
        }
        else{
            ST = 0;
            ED = filter_list.value.length;
        }
        if(ST < 0) return 0;
        if(option&4){
            items_in_page.value = [];
            for(var i=ST; i<ED; i++){
                tableData.value[i]._IDX = filter_list.value[i];
                items_in_page.value[L2++] = tableData.value[filter_list.value[i]];
                isALL &= tableData.value[filter_list.value[i]].ISselected;
            }
            if(pageOption.value.enable_page == 1) ISselect_pageALL.value[now_page.value] = isALL && filter_list.value.length;
            else ISselect_filteredALL.value = isALL;
        }

        if(option&2){
            for(var i in tableData.value){
                tableData.value[i]._IDX = i;
                if(tableData.value[i].ISselected == undefined) tableData.value[i].ISselected = false;
                if(tableData.value[i].editing == undefined){
                    tableData.value[i].editing = {};
                }
                for(var j in titleOrder.value){
                    if(!tableData.value[i].editing[titleOrder.value[j]]) tableData.value[i].editing[titleOrder.value[j]] = {ISediting:0, temp:''};
                }
            }
        }

        if(option&1){
            var max_page_length = Math.ceil((filter_list.value.length || 0) / itemnum_perpage.value);
            page_tag.value.length = Math.min(pageOption.value.max_show, max_page_length);
            var s = Math.max(
                Math.min(
                    max_page_length - pageOption.value.max_show,
                    now_page.value - Math.ceil(pageOption.value.max_show / 2)
                    ),
                0
            );
            for(var i=0; i<page_tag.value.length; i++){
                page_tag.value[i] = i+s+1;
            }
        }

        if(['new_item', 'edit_item', 'switch_item'].includes(actions.value[actions.value.length-1])) sortby.value = '';
    };
    var select_item = function(type, item, option){
        if(!dataOption.value.enable_select)return;
        if(type == "pageALL"){
            var ST = (now_page.value-1) * itemnum_perpage.value;
            var ED = Math.min(now_page.value * itemnum_perpage.value, filter_list.value.length);
            if(ST < 0) return 0;
            var set_value = option != undefined ? option : !ISselect_pageALL.value[now_page.value];
            for(var i=ST; i<ED; i++){
                select_item("one", tableData.value[filter_list.value[i]], !set_value);
            }
            ISselect_pageALL.value[now_page.value] = set_value;
        }
        else if(type == "filteredALL"){
            var set_value = option != undefined ? option : !ISselect_filteredALL.value;
            for(var i in filter_list.value){
                select_item("one", tableData.value[filter_list.value[i]], !set_value);
            }
            ISselect_filteredALL.value = set_value;
        }
        else if(type == "realALL"){
            var set_value = option != undefined ? option : !ISselect_realALL.value;
            for(var i in tableData.value){
                select_item("one", tableData.value[i], !set_value);
            }
            ISselect_realALL.value = set_value;
        }
        else if(type == "one"){
            if(option != undefined) item.ISselected = option;
            if(item._UID == undefined) item._UID = produceUID(8);  //@@@@
            if(!item.ISselected){
                item.ISselected = true;
                items_ISselected.value[item._UID] = item;
            }
            else{
                item.ISselected = false;
                delete items_ISselected.value[item._UID];
            }
        }
        else if(type == 'update'){
            if(item.ISselected){
                items_ISselected.value[item._UID] = item;
            }
            else{
                delete items_ISselected.value[item._UID];
            }
        }
        if(type != "one" || option == undefined)actions.value.push('select_' + type);
        if(option == undefined)update_items_perpage(4);
    };
    var select_page = function(page){
        if(typeof page == "string"){
            var n = page.match(/\d+/g);
            if(n == null) page_elevator = page = 1;
            else page = parseInt(n.join(""));
        }
        else if(typeof page == "number") page = parseInt(page);
        else return;
        if(now_page.value == page) return;
        max_page.value = Math.ceil(filter_list.value.length / itemnum_perpage.value);
        now_page.value = Math.min(Math.max(1, page), max_page.value);
        var ST = (now_page.value-1) * itemnum_perpage.value;
        var ED = Math.min(now_page.value * itemnum_perpage.value, filter_list.value.length);
        if(ST < 0) return 0;
        items_in_page.value = [];
        for(var i=ST; i<ED; i++){
            items_in_page.value.push(tableData.value[filter_list.value[i]]);
        }
        actions.value.push('select_page');
        update_items_perpage(5);
    };
    var sort_list = function(according){
        if(editing_num.value || !dataOption.value.enable_sort || !enable_sort.value)return;
        //if(!Array.isArray(sortOption.value) || !sortOption.value.includes(according)) return 0;
        var type = sortby.split('-'), sortby = type[0];
        type = type[1] == undefined ? 0 : parseInt(type[1]);

        if(sortby.value == according){
            parent.value.for_table_item.globalActions[nbfrom.value].push({action:"reverse", sortby: sortby, orig: this});
            tableData.value.reverse();
            sortby.value = sortby.value + '-' + (type+1)%2;
        }
        else{
            parent.value.for_table_item.globalActions[nbfrom.value].push({action:"sort_list", orig: this, sortby: sortby, value:tableData.value.duplicate()});
            sortby.value = according + '-0';
            tableData.value.sort(function(a,b){return a[according] > b[according] ? 1 : -1;})
        }
        actions.value.push('sort_list');
        update_items_perpage(4);
    };
    var search_delay = function(ms){
        clearInterval(search_dt);
        search_dt = setTimeout(function(){search(1)}, ms);
    };
    var search = function(p){
        var sd = search_data.value;
        for(var i in additional_search_data.value){
            sd += '&' + Object.keys(additional_search_data.value[i]).join() + '';
        }
        if(search_data.value == '')sd = sd.slice(1);
        filter_list.value = cfun.search3({
            search_from: tableData.value,
            search_data: sd, 
            search_depth: 1,
            map_depth: 1,
            exclude: Object.isDict(searchOption.value.exclude) ? searchOption.value.exclude : {'_IDX':1, 'ISselected':1, 'editing':1, '_UID':1},
            trans: typeof searchOption.value.trans == 'object' ? searchOption.value.trans : {}
        });
        filter_list.value.length = filter_list.value.length;
        if(p)actions.value.push('search');
        update_items_perpage(5);
    };
    var search_single = function(sf){
        var sd = search_data.value;
        for(var i in additional_search_data.value){
            sd += '&' + Object.keys(additional_search_data.value[i]).join() + '';
        }
        if(search_data.value == '')sd = sd.slice(1);
        return cfun.search3({
            search_from: sf,
            search_data: sd, 
            search_depth: 0,
            map_depth: 0,
            exclude: Object.isDict(searchOption.value.exclude) ? searchOption.value.exclude : {'_IDX':1, 'ISselected':1, 'editing':1, '_UID':1},
            trans: typeof searchOption.value.trans == 'object' ? searchOption.value.trans : {}
        });
    };
    var select_additional_condition = function(type, item){
        if(additional_search_data.value[type] == undefined) additional_search_data.value[type] = {};
        if(item == '')delete additional_search_data.value[type];
        else if(item in additional_search_data.value[type]) delete additional_search_data.value[type][item];
        else additional_search_data.value[type][item] = 1;
        search(1);
    };
    var switch_item_operation = function(type, _IDX, target, pushAct){ console.log(type, _IDX)
        if(type == 'clear'){
            parent.value.for_table_item.drop_box._IDX = '';
            parent.value.for_table_item.drop_box.tmp = 0;
            parent.value.for_table_item.drop_box.uid = '';
        }
        else if(type == 'change'){
            var tmp, actData;
            if(!(dataOption.value.enable_edit && enable_edit.value)){//交換
                if(pushAct) actData = {action:"switch", orig:this, target:target, origIdx:_IDX, targetIdx: target.parent.value.for_table_item.drop_box._IDX};
                delete target.items_ISselected.value[target.tableData[target.parent.value.for_table_item.drop_box._IDX]._UID];
                delete items_ISselected.value[tableData.value[_IDX]._UID];

                for(var i in tableData.value[_IDX]){
                    tmp = target.tableData[target.parent.value.for_table_item.drop_box._IDX][i].duplicate();
                    target.tableData[target.parent.value.for_table_item.drop_box._IDX][i] = tableData.value[_IDX][i].duplicate();
                    tableData.value[_IDX][i] = tmp;
                }

                target.select_item('update', target.tableData[target.parent.value.for_table_item.drop_box._IDX]);
                select_item('update', tableData.value[_IDX]);

                if(target.c_UID != c_UID.value){
                    var tf = search_single(tableData.value[_IDX]);
                    var ii = filter_list.value.insert_idx2(_IDX);
                    if(tf && ii%1 == 0){
                        filter_list.value.push(_IDX);
                        filter_list.value.sort();
                    }
                    else if(!tf && ii%1 == 0.5){
                        filter_list.value.remove(Math.floor(ii));
                    }

                    var ttf = target.search_single(target.tableData[target.parent.value.for_table_item.drop_box._IDX]);
                    var tii = target.filter_list.value.insert_idx2(target.parent.value.for_table_item.drop_box._IDX);
                    if(ttf && tii%1 == 0){
                        target.filter_list.value.push(_IDX);
                        target.filter_list.value.sort();
                    }
                    else if(!ttf && tii%1 == 0.5){
                        target.filter_list.value.remove(tii-0.5);
                    }
                }
                // actData.targetIdx = target.parent.value.for_table_item.drop_box._IDX;
                if(pushAct) parent.value.for_table_item.globalActions[nbfrom.value].push(actData);
            }
            else{//移動
                if(c_UID.value != target.c_UID){
                    if(pushAct) actData = {action:"move", orig:this, target:target, origIdx:_IDX, targetIdx: target.parent.value.for_table_item.drop_box._IDX};
                    var ii = filter_list.value.insert_idx2(_IDX);
                    if(ii%1){
                        filter_list.value.remove(Math.floor(ii));
                        var tifL=filter_list.value.length;
                        for(var i=Math.floor(ii); i<tifL; i++){
                            filter_list.value[i]--;
                        }
                    }
                    // for(var i=Math.floor(ii);i<filter_list.value.length;i++){
                    //     filter_list.value[i]--;
                    // }
                    
                    var ttf = target.search_single(tableData.value[_IDX]);
                    var tii = target.filter_list.value.insert_idx2(parent.value.for_table_item.drop_box._IDX);

                    delete items_ISselected.value[tableData.value[_IDX]._UID];
                    target.tableData.insert([tableData.value[_IDX]], parent.value.for_table_item.drop_box._IDX);
                    tableData.value.remove(_IDX);
                    

                    target.select_item('update', target.tableData[target.parent.value.for_table_item.drop_box._IDX]);
                    
                    if(ttf && tii%1 == 0.5){
                        var tafL=target.filter_list.value.length;
                        target.filter_list.value.push(tii-0.5);
                        for(var i=tii-0.5; i<tafL; i++){
                            target.filter_list.value[i]++;
                        }
                        target.filter_list.value.sort();
                    }
                    if(pushAct) parent.value.for_table_item.globalActions[nbfrom.value].push(actData);
                }
                else{
                    if(pushAct) actData = {action:"move", orig:this, target:target, origIdx:_IDX, targetIdx: target.parent.value.for_table_item.drop_box._IDX};
                    target.tableData.insert([tableData.value[_IDX]], parent.value.for_table_item.drop_box._IDX+1);
                    if(parent.value.for_table_item.drop_box._IDX > _IDX)tableData.value.remove(_IDX);
                    else tableData.value.remove(_IDX+1);
                    if(pushAct) parent.value.for_table_item.globalActions[nbfrom.value].push(actData);
                }
            }
            
            switch_item_operation('clear');
            target.actions.push('switch_item');
            actions.value.push('switch_item');
            
            target.update_items_perpage(5);
            update_items_perpage(5);
        }
        else if(type == 'record'){ 
            parent.value.for_table_item.drop_box._IDX = _IDX;
            // parent.value.for_table_item.drop_box._IDX = Math.floor(filter_list.value.insert_idx2(_IDX));console.log(parent.value.for_table_item.drop_box._IDX)
            parent.value.for_table_item.drop_box.uid = target; // target is id
            update_items_perpage(4);
        }
    };
    var switch_item = function(e, i, id){
        if(!(id in parent.value.table_item)) return;
        if(e.type == 'dragstart'){
            if(!(dataOption.value.enable_drag && enable_drag.value))return;
            parent.value.for_table_item.drop_box.tmp = i == -1 ? 2 : 1;
            if(parent.value.for_table_item.drop_box.uid == ''){
                parent.value.for_table_item.drop_box.uid = id;
            }
        }
        else if(e.type == 'drop'){
            if(editing_num.value) parent.value.for_table_item.drop_box.tmp = 8;
            else if(parent.value.for_table_item.drop_box.tmp < 3)parent.value.for_table_item.drop_box.tmp += i == -1 ? 2 : 4;
            var dbtmp = parent.value.for_table_item.drop_box.tmp;
            if(dbtmp == 5 && parent.value.for_table_item.drop_box._IDX == ''){
                switch_item_operation('record', i, id);
                parent.value.for_table_item.drop_box.tmp = 7;
            }

            else if(dbtmp == 6){
                if(dataOption.value.enable_edit && enable_edit.value)parent.value.table_item[parent.value.for_table_item.drop_box.uid].switch_item_operation('change', i, this);
                else switch_item_operation('change', i, parent.value.table_item[parent.value.for_table_item.drop_box.uid], 1);
            }
        }
        else if(e.type == 'dragend'){
            var dbtmp = parent.value.for_table_item.drop_box.tmp;
            if(dbtmp == 1){
                if(parent.value.for_table_item.drop_box._IDX === ''){
                    switch_item_operation('clear');
                }
            }
            else if(dbtmp == 2 || dbtmp == 8){
                switch_item_operation('clear');
            }

            else if(dbtmp == 3){
                switch_item_operation('record', i, id);
            }

            else if(dbtmp == 7){
                switch_item_operation('change', i, parent.value.table_item[parent.value.for_table_item.drop_box.uid], 1);
            }
        }
        else if(e.type == 'contextmenu'){
            switch_item_operation('clear');
        }
    };
    var edit_item = function(type, _IDX, col, ISapplyALL){
        if(type == 'startedit' && dataOption.value.enable_edit && enable_edit.value){
            if(!tableData.value[_IDX].editing[col].ISediting){
                if(enable_language.value) tableData.value[_IDX].editing[col].temp = tableData.value[_IDX][col][now_language.value];
                else tableData.value[_IDX].editing[col].temp = tableData.value[_IDX][col];
                editing_num.value += 1;
                tableData.value[_IDX].editing[col].ISediting = 1;

                if(editing_box[_IDX] == undefined)editing_box[_IDX] = {};
                editing_box[_IDX][col] = tableData.value[_IDX].editing[col];
            }
        }
        else if(type == 'apply'){
            if(tableData.value[_IDX].editing[col].ISediting){
                if(enable_language.value) parent.value.for_table_item.globalActions[nbfrom.value].push({action:"edit", orig: this, _IDX: _IDX, col: col, value: tableData.value[_IDX][col][now_language.value]});
                else parent.value.for_table_item.globalActions[nbfrom.value].push({action:"edit", orig: this, _IDX: _IDX, col: col, value: tableData.value[_IDX][col]});

                if(enable_language.value) tableData.value[_IDX][col][now_language.value] = tableData.value[_IDX].editing[col].temp;
                else tableData.value[_IDX][col] = tableData.value[_IDX].editing[col].temp;
                editing_num.value -= 1;
                tableData.value[_IDX].editing[col].ISediting = 0;

                delete editing_box[_IDX][col];
            }
        }
        else if(type == 'cancel'){
            if(tableData.value[_IDX].editing[col].ISediting){
                editing_num.value -= 1;
                tableData.value[_IDX].editing[col].ISediting = 0;

                delete editing_box[_IDX][col];
            }
        }
        else if(type == 'applyALL'){
            var edits = [], editing_numT = editing_num;
            for(var i in editing_box){
                for(var j in editing_box[i]){
                    if(editing_box[i][j].ISediting)edits.push(edit_item('apply', i, j, 1));
                }
                if(!editing_num.value)break;
            }
            
            parent.value.for_table_item.globalActions[nbfrom.value].push({action:"editAll", orig:this, editing_num: editing_numT});
            filter_list.value.remove(edits);
            filter_list.value.sort(function(a,b){return a>b?1:-1});
            update_items_perpage(5);
        }
        else if(type == 'cancelALL'){
            for(var i in editing_box){
                for(var j in editing_box[i]){
                    if(editing_box[i][j].ISediting)edit_item('cancel', i, j);
                }
                if(!editing_num.value)break;
            }
        }
        else if(type == "deleteALL"){
            var L = Object.keys(items_ISselected.value).length;
            if(L == 0) return 0;
            var form = {
                title: "確認刪除所選" + L + "筆資料？",
                icon: "warning",
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: "確認",
                confirmButtonAriaLabel: "confirm",
                cancelButtonText: "取消",
                cancelButtonAriaLabel: "cancel"
            }
            Swal.fire(form).then((result) => {
                if(result.isConfirmed){
                    var lst = [], L;
                    for(var i in items_ISselected.value){
                        lst.push(items_ISselected.value[i]._IDX);
                    }
                    L = lst.length;
                    lst.sort(function(a,b){return a<b?1:-1});
                    for(var i in lst){
                        parent.value.for_table_item.globalActions[nbfrom.value].push({action:"delete", orig: this, _IDX: lst[i], value: tableData.value.splice(lst[i], 1)[0]});
                    }
                    parent.value.for_table_item.globalActions[nbfrom.value].push({action:"deleteAll", orig:this, delete_num: L});

                    items_ISselected.value = {};
                    // select_item("realALL",0 , 0);
                    search();
                }
            });
        }

        if(type == 'apply'){
            var tf = search_single(tableData.value[_IDX]);
            var ii = filter_list.value.insert_idx2(_IDX);
            if(tf && ii%1 == 0){
                filter_list.value.push(_IDX);
                if(ISapplyALL)return;
                filter_list.value.sort();
            }
            else if(!tf && ii%1 == 0.5){
                if(ISapplyALL)return Math.floor(ii);
                filter_list.value.remove(Math.floor(ii));
            }
            actions.value.push('edit_item');
            update_items_perpage(5);
        }
    };
    var new_item = function(tbid, _IDX, option){
        var target = parent.value.table_item[tbid];
        if(!target.dataOption.enable_newdata)return;

        if(typeof _IDX == "string"){
            var n = _IDX.match(/\d+/g),m = _IDX.match(/-+/g);
            m = Math.pow(-1, m ? m.join("").length : 0);
            if(n == null) new_item_idx = _IDX = 0;
            else _IDX = m*parseInt(n.join(""));
        }
        else if(typeof _IDX == "number") _IDX = parseInt(_IDX);

        if(_IDX < 0) _IDX = (_IDX + target.tableData.length + 1).minmax(0, target.tableData.length);

        var q = "";
        for(var i in all_data_keys.value){
            q += "<p>輸入" + (textTrans.value[all_data_keys.value[i]] || all_data_keys.value[i]) + "</p>";
            q += `<input id="new_` + all_data_keys.value[i] + `" autocomplete="off"/>`;
        }

        var r = {ISselected:false, editing:{}, _UID:produceUID(15)};
        parent.value.for_table_item.globalActions[nbfrom.value].push({action:"newItem", orig:this, _IDX: _IDX});
        
        if(option){
            for(var i in all_data_keys.value){
                r[all_data_keys.value[i]] = "";
                r.editing[all_data_keys.value[i]] = {ISediting: 0, temp: ""};
            }
            target.tableData.insert([r], _IDX);
            target.update_items_perpage(7);
            target.search();
            actions.value.push('new_item');
            return 0;
        }
        
        Swal.fire({
            html: q,
            showCancelButton: true,
            cancelButtonColor: '#d33',
            preConfirm: () => {
                for(var i in all_data_keys.value){
                    r[all_data_keys.value[i]] = document.getElementById("new_" + all_data_keys.value[i]).value;
                    r.editing[all_data_keys.value[i]] = {ISediting: 0, temp: ""};
                }
                target.tableData.insert([r], _IDX);
                var tf = target.search_single(target.tableData[_IDX]);
                var ii = parseInt(target.filter_list.value.insert_idx2(_IDX));
                if(tf){
                    target.filter_list.value.insert([ii], _IDX);
                    for(var i=_IDX+1;i<target.filter_list.value.length;i++){
                        target.filter_list.value[i]++;
                    }
                }
                target.update_items_perpage(7);
                target.search();
                actions.value.push('new_item');
            }
        });
    };
    var drag_hover = function(type, i, id){
        if(type == 'over'){
            now_over = i;
        }
        else if (type == 'leave'){
            if(now_over != -2)now_over = -2;
        }
    };
    var synchronize = function(){
        whenUpdate(1);
        search(0);
        actions.value.push('synchronize');
    };
    var produceUID = function(n){
        var w = 'qazwsxedcrfvtgbyhnujmikolpQAZWSXEDCRFVTGBYHNUJMIKOLP', wd = 'qazwsxedcrfvtgbyhnujmikolp0123456789QAZWSXEDCRFVTGBYHNUJMIKOLP';
        var r = '';
        r += w[parseInt(Math.random()*52)];
        for(var i=1;i<n;i++) r+= wd[parseInt(Math.random()*62)];
        return r;
    };



    var mountedF = function(){
        search(0);
        if(pageOption.value.enable_page == 2)tableHeight = (pageOption.value.scroolheight || $el.value.getElementsByClassName(c_UID)[0].getElementsByTagName('tr')[0].offsetHeight * 11) + 'px';
    }
    onMounted(mountedF);

    var beforeUpdateF = function(){
        // dataOption.value.enable_language.value = !!Object.keys(textTrans.value).length;
        if(dataOption.value.enable_language.value && !(now_language.value in textTrans.value))now_language.value = Object.keys(textTrans.value)[0];
    }
    onBeforeUpdate(beforeUpdateF);

    var updatedF = function(){
        console.log('updated: ' + c_UID.value);
        whenUpdate(0);
    }
    onUpdated(updatedF);

    // created
    var isRunCreatedF = ref(0);
    var createdF = function(thisref){
        if(isRunCreatedF.value) return;
        isRunCreatedF.value++;
        parent.value.table_item[c_UID] = thisref;
    }

    whenUpdate(0);
    all_data_keys = titleOrder;
    update_items_perpage(7);
    if(passedData.value.c_UID == undefined){
        c_UID.value = produceUID(10);
        passedData.value.c_UID = c_UID.value;
    }
    else{
        c_UID.value = passedData.value.c_UID;
    }


    if(!Object.isDict(parent.value.table_item)) parent.value.table_item = {};
    if(!Object.isDict(parent.value.for_table_item)) parent.value.for_table_item = {};
    if(!parent.value.for_table_item.drop_box) parent.value.for_table_item.drop_box = {};
    if(!parent.value.for_table_item.globalActions) parent.value.for_table_item.globalActions = {};
    if(!parent.value.for_table_item.globalActions[nbfrom]) parent.value.for_table_item.globalActions[nbfrom] = [];
    console.log(c_UID);

    for(var i in tableData){
        if(tableData[i]._UID == undefined)tableData[i]._UID = produceUID(15);
    }

    var rfdb = parent.value.for_table_item.drop_box;
    rfdb._IDX = rfdb._IDX == undefined ? '' : rfdb._IDX;
    rfdb.tmp = rfdb.tmp == undefined ? 0 : rfdb.tmp;
    rfdb.uid = rfdb.uid == undefined ? '' : rfdb.uid;

    var onUnmountedF = function(){
        delete parent.value.table_item[c_UID.value];
        console.log('delete: ' + c_UID.value);
    }
    onUnmounted(onUnmountedF);

</script>

<template>
    <div :class="customClass.box" ref="$el" :oncreatedBinding="createdF(this)">
        <div class="input-group mb-2" v-if="searchOption.enable_search">
            <button :class="customClass.menu_trigger" class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-toolbox"></i></button>
            <ul class="dropdown-menu dropdown-large py-2 shadow-sm">
                <li class="p-0" @click.stop><h5 class="d-block mb-0 text-secondary fw-light px-2 pb-1 pt-0">功能表</h5></li>
                <li class="p-0" @click.stop v-if="dataOption.enable_edit || dataOption.enable_drag"><h6 class="dropdown-header fw-light px-2 pb-1 pt-0">資料操作</h6></li>
                <li class="px-2" @click.stop>
                    <div style="margin-right:10px;" v-if="dataOption.enable_edit" @click="enable_edit = editing_num ? true : (dataOption.enable_edit && !enable_edit)" :class="customClass.menu_btn + ' ' + (dataOption.enable_edit && enable_edit ? customClass.menu_btn_trigger1 : customClass.menu_btn_trigger0)">
                        <h6 class="mb-0">編輯模式</h6>
                    </div>
                    <div style="margin-right:10px;" v-if="dataOption.enable_drag" @click="enable_drag = !enable_drag & dataOption.enable_drag" :class="customClass.menu_btn + ' ' + (enable_drag ? customClass.menu_btn_trigger1 : customClass.menu_btn_trigger0)">
                        <h6 class="mb-0">交換模式</h6>
                    </div>
                    <div style="margin-right:10px;" v-if="dataOption.enable_sort" @click="enable_sort = !enable_sort & dataOption.enable_sort" :class="customClass.menu_btn + ' ' + (enable_sort ? customClass.menu_btn_trigger1 : customClass.menu_btn_trigger0)">
                        <h6 class="mb-0" v-text="['開啟', '關閉'][enable_sort ? 1 : 0] + '排序'"></h6>
                    </div>
                </li>
                <li class="my-2" v-if="dataOption.enable_edit || dataOption.enable_drag"></li>
                
                <li class="px-2" @click.stop>
                    <div style="margin-right:10px;" @click="select_item('filteredALL')" :class="customClass.menu_btn + ' ' + (ISselect_filteredALL ? customClass.menu_btn_trigger1 : customClass.menu_btn_trigger0)">
                        <h6 class="mb-0">((ISselect_filteredALL ? '取消全選':'全選過濾'))</h6>
                    </div>
                    <div style="margin-right:10px;" @click="edit_item('applyALL')" :class="customClass.menu_btn + ' ' + customClass.menu_btn_trigger0">
                        <h6 class="mb-0">全部確認編輯</h6>
                    </div>
                    <div style="margin-right:10px;" @click="edit_item('cancelALL')" :class="customClass.menu_btn + ' ' + customClass.menu_btn_trigger0">
                        <h6 class="mb-0">全部取消編輯</h6>
                    </div>
                </li>
                <li class="my-2"></li>

                <li class="px-2" @click.stop>
                    <div style="margin-right:10px;" @click="edit_item('deleteALL')" :class="customClass.menu_btnWarning + ' ' + customClass.menu_btnWarning_trigger0">
                        <h6 class="mb-0">刪除所選資料</h6>
                    </div>
                </li>
                <li class="my-2"></li>

                <li class="px-2" @click.stop v-if="dataOption.enable_newdata">
                    <p class="btn btn-lg m-0 p-1">在</p>
                    <div class="d-flex">
                        <div style="margin-right:10px;" class="menu_input mx-2 col-md-2">
                            <input class="mb-0 w-100 text-center" type="text" autocomplete="off" v-model="new_item_idx"/>
                        </div>
                        <div style="margin-right:10px;" @click="new_item(c_UID, new_item_idx)" :class="customClass.menu_btn + ' ' + customClass.menu_btn_trigger0">
                            <h6 class="mb-0">新增一筆資料</h6>
                        </div>
                        <div style="margin-right:10px;" @click="new_item(c_UID, new_item_idx, 1)" :class="customClass.menu_btn + ' ' + customClass.menu_btn_trigger0">
                            <h6 class="mb-0">新增一筆空白資料</h6>
                        </div>
                    </div>
                </li>
                <li class="my-2" v-if="dataOption.enable_newdata"></li>

                <li class="p-0" @click.stop><h5 class="d-block mb-0 text-secondary fw-light px-2 pb-1 pt-0">電梯</h5></li>
                <li class="px-2" @click.stop>
                    <div class="d-flex">
                        <div style="margin-right:10px;" class="menu_input mx-2 col-md-2">
                            <input class="mb-0 w-100 text-center" type="text" autocomplete="off" v-model="page_elevator"/>
                        </div>
                        <div style="margin-right:10px;" @click="select_page(page_elevator)" :class="customClass.menu_btn + ' ' + customClass.menu_btn_trigger0">
                            <h6 class="mb-0">直達</h6>
                        </div>
                    </div>
                </li>
            </ul>

            <button :class="customClass.menu_trigger" class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-search"></i></button>
            <ul class="dropdown-menu dropdown-large py-2 shadow-sm">
                <div v-for="(row, type) in searchOption.additional">
                    <li @click.stop v-if="type != Object.keys(searchOption.additional)[0]"><hr class="dropdown-divider"></li>
                    <li><h6 class="dropdown-header fw-light px-2 pb-1 pt-0">((type))</h6></li>
                    <li class="px-2" @click.stop>
                        <div style="margin-right:10px;" @click="select_additional_condition(type, '')" :class="customClass.menu_btn + ' ' + customClass.menu_btn_trigger0">
                            <h6 class="mb-0"><i class="fas fa-ban"></i></h6>
                        </div>
                        <div v-for="(item, name) in row" style="margin-right:10px;" @click="select_additional_condition(type, item)" :class="customClass.menu_btn + ' ' + (type in additional_search_data ? (additional_search_data[type][item] ? customClass.menu_btn_trigger1 : customClass.menu_btn_trigger0): customClass.menu_btn_trigger0)">
                            <h6 class="mb-0">((name))</h6>
                        </div>
                    </li>
                </div>
            </ul>

            <div class="btn btn-outline-secondary" v-if="Object.keys(items_ISselected).length">
                <i class="far fa-object-ungroup"></i>
                <h6 class="ps-2 mb-0 d-inline-block" v-text="'已選擇：'+Object.keys(items_ISselected).length+'項'"></h6>
            </div>
            <input :class="customClass.search_input" @input="search_delay(1000)" @keydown.enter="search(1)" v-model="search_data" v-if="searchOption.enable_search"/>
        </div>

        <div class="vertical-txt col-md-12 rounded shadow-sm btn position-absolute"
            :class="now_over == -1 ? 'IShoverTmpdiv':'bg-white'"
            :draggable="!!(dataOption.enable_drag && enable_drag && !editing_num)"
            @dragstart="switch_item($event, -1, c_UID)"
            @drop="switch_item($event, -1, c_UID), drag_hover('leave', -1, c_UID)"
            @dragenter.prevent
            @dragover.prevent="drag_hover('over', -1, c_UID)"
            @dragleave.prevent="drag_hover('leave', -1, c_UID)"
            @dragend="switch_item($event, -1, c_UID), drag_hover('leave', -1, c_UID)"
            @contextmenu.prevent="switch_item($event, -1, c_UID)"
            v-if="parent.value.for_table_item.drop_box.tmp && parent.value.for_table_item.drop_box.uid == c_UID && dataOption.enable_drag && enable_drag">

            <p class="px-2 d-inline-block" v-if="parent.value.for_table_item.drop_box.tmp && parent.value.for_table_item.drop_box._IDX !== ''" v-for="i in titleOrder"> ((tableData[parent.value.for_table_item.drop_box._IDX][i])) </p>
            <p class="d-inline-block" v-else v-for="i in '將要移動的項目放置到此'"> ((i)) </p>
        </div>

        <div class="overflow-auto d-flex mb-3" :class="c_UID" :style=" tableHeight ? 'height:'+tableHeight : ''">
            <table :class="customClass.table">
                <thead :class="customClass.thead">
                    <tr :class="(customClass.trh + ' ' + customClass.tr).trim()">
                        <th :class="customClass.th" width="50" v-if="dataOption.enable_select">
                            <div style="cursor:pointer; margin:10px; max-width:24px;">
                                <i class="far fa-square fa-lg" v-if="pageOption.enable_page == 1 ? !ISselect_pageALL[now_page] : !ISselect_filteredALL" @click="select_item(pageOption.enable_page == 1 ? 'pageALL' : 'filteredALL')"></i>
                                <i class="far fa-check-square fa-lg" v-if="pageOption.enable_page == 1 ? ISselect_pageALL[now_page] : ISselect_filteredALL" @click="select_item(pageOption.enable_page == 1 ? 'pageALL' : 'filteredALL')"></i>
                            </div>
                        </th>
                        <th :style="(enable_sort?'cursor:pointer;':'cursor:default;') + 'width:calc((100%-50px)/' + titleOrder.length+ ');'" :class="customClass.th" v-for="i in titleOrder" @click="sort_list(i)">
                            <span>(((dataOption.enable_language ? textTrans[now_language][i] : textTrans[i]) || i))</span>
                            <span v-if="sortby.split('-')[0] === i" class="ms-2">
                                <i class="fas fa-sort-amount-up" v-if="sortby.split('-')[1] === '0'"></i>
                                <i class="fas fa-sort-amount-down" v-if="sortby.split('-')[1] === '1'"></i>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody :class="customClass.tbody">
                    <tr :class="(customClass.trb + ' ' + customClass.tr + ' ' + (now_over == row._IDX ? 'IShover':'')).trim()"
                        v-for="(row, rowidx) in items_in_page"
                        :draggable="!!(dataOption.enable_drag && enable_drag && !editing_num)"
                        @dragstart="switch_item($event, row._IDX, c_UID)"
                        @drop="switch_item($event, row._IDX, c_UID), drag_hover('leave', row._IDX, c_UID)"
                        @dragenter.prevent
                        @dragover.prevent="drag_hover('over', row._IDX, c_UID)"
                        @dragleave.prevent="drag_hover('leave', row._IDX, c_UID)"
                        @dragend="switch_item($event, row._IDX, c_UID), drag_hover('leave', row._IDX, c_UID)">
                        
                        <td :class="customClass.th" v-if="dataOption.enable_select">
                            <div style="cursor:pointer; margin:10px; max-width:24px;">
                                <i class="far fa-square fa-lg" v-if="!row.ISselected" @click="select_item('one', row)"></i>
                                <i class="far fa-check-square fa-lg" v-if="row.ISselected" @click="select_item('one', row)"></i>
                            </div>
                        </td>
                        <td :style="(enable_drag||enable_edit) ? 'cursor:pointer;' : 'cursor:text'" :class="customClass.td" v-for="(col, colkey) in titleOrder" @click="edit_item('startedit', filter_list[(now_page-1)*itemnum_perpage+rowidx], col)">
                            <span v-if="row.editing[col].ISediting && dataOption.enable_edit && enable_edit">
                                <input style="width: 100%;" type="text" autocomplete="off" autofocus v-model="row.editing[col].temp" @keyup.enter="edit_item('apply', filter_list[(now_page-1)*itemnum_perpage+rowidx], col)" @keyup.esc="edit_item('cancel', row._IDX, col)"/>
                            </span>
                            <span v-else v-text="(dataOption.enable_language ? (textTrans[now_language][row[col]] || row[col][now_language]) : row[col]) || row[col]"></span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div :class="customClass.page_group" v-if="pageOption.enable_page == 1">
            <div :class="customClass.page_info">
                <span>每頁</span>
                <select :class="customClass.set_page_num" v-model="itemnum_perpage" @click="update_items_perpage(4)">
                    <option v-for="i in pageOption.perpagelist">((i))</option>
                </select>
                <span>筆，共</span>
                <span v-text="filter_list.length"></span>
                <span>筆</span>
            </div>
            <div :class="customClass.page_select">
                <button type="button" :class="customClass.page_select_btn + ' ' + customClass.page_select_trigger0" @click="select_page(1)" title="第一頁">&laquo;</button>
                <button type="button" :class="customClass.page_select_btn + ' ' + (now_page == i ? customClass.page_select_trigger1 : customClass.page_select_trigger0)" v-for="i in page_tag" @click="select_page(i)">((i))</button>
                <button type="button" :class="customClass.page_select_btn + ' ' + customClass.page_select_trigger0" @click="select_page(Math.ceil(Object.keys(filter_list).length / itemnum_perpage))" title="最後頁">&raquo;</button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
</style>