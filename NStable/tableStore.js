import { createStore } from 'vuex'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import { chatEX } from '@/js/NSchatEX.js'
import Swal from 'sweetalert2'
import _ from 'lodash'

import { def } from '@vue/shared'

export default createStore({
    state () {
        return {
            data: {},
            titleOrder: {},
            // [
            //     "String"
            //     or
            //     {
            //        key: "String",
            //        text: "String",
            //     }
            // ],

            sortKey: {}, // ''
            sortDir: {}, // 1 or -1
            
            searchText: {}, // ''
            currentPage: {}, // 1
            pageSize: {}, // 10

            // 0: view, 1: edit, 2: select, 3: switch
            nowMode: {}, // 1
            enableMode: {}, // [0, 1, 2, 3]

            filters: {
                // [
                //     {
                //     id: String,
                //     name: String,
                //     func: Function,
                //     icon: String (optional, in class of <i> tag)
                //     image: String (optional, in src of <img> tag)
                //     text: String (optional, in class of <span> tag)
                //     group: String (optional, in class of <div> tag)
                    
                //     status: Boolean (auto generated)
                //     }
                // ],
            },
            select: {
                // same as filters, but no group
            }, 
            actions: {
                // click: ($event, nowMode, rowData, col) => {},
                // contextmenu: ($event, nowMode, rowData, col) => {},
                // nodata: () => {},
            },

            editingRow: {}, // null
            viewingRow: {}, // null

            // for list table
            cells: {}, // []
            dragObj: {}, // []

            tablesToUpdate: new Set(), // { tableHashs... }
        }
    },
    mutations: {
        initTable(state, {tableID, tableHash}) {
            // count how many times the same table is created
            if(!state.data[tableID]) {
                state.tablesToUpdate.add(tableHash);
            } else {
                return;
            }

            state.data[tableID] = [];
            state.titleOrder[tableID] = [];

            state.sortKey[tableID] = '';
            state.sortDir[tableID] = 1;

            state.searchText[tableID] = '';
            state.currentPage[tableID] = 1;
            state.pageSize[tableID] = 10;

            state.nowMode[tableID] = 1;
            state.enableMode[tableID] = [0, 1, 2, 3];

            state.filters[tableID] = [];
            state.select[tableID] = [];
            state.actions[tableID] = {
                click: ($event, nowMode, rowData, col) => {},
                contextmenu: ($event, nowMode, rowData, col) => {},
                nodata: () => {},
            };

            state.editingRow[tableID] = null;
            state.viewingRow[tableID] = null;

            state.cells[tableID] = [];
            state.dragObj[tableID] = [];
        },
        // add index to data
        updateData(state, {tableID, tableHash, data}) {
            if(!state.tablesToUpdate.has(tableHash)) return;

            state.data[tableID] = data.map((row, index) => {
                const _row = _.cloneDeep(row);
                return {
                    ..._row,
                    _index: index,
                    _selected: false,
                };
            });
        },
        updateTitleOrder(state, {tableID, tableHash, titleOrder}) {
            if(!state.tablesToUpdate.has(tableHash)) return;

            state.titleOrder[tableID] = titleOrder.map(title => {
                if (typeof title === "string") {
                    return {
                        key: title,
                        text: title,
                    };
                }
                else if (Array.isArray(title)) {
                    return title.map(k => {
                        return {
                            key: k,
                            text: k,
                        };
                    });
                }
                return title;
            });
        },
        updateFilters(state, {tableID, tableHash, filters}) {
            if(!state.tablesToUpdate.has(tableHash)) return;

            state.filters[tableID] = filters.map(filter => {
                return {
                    ...filter,
                    status: false,
                };
            });
        },
        updateSelect(state, {tableID, tableHash, select}) {
            if(!state.tablesToUpdate.has(tableHash)) return;

            state.select[tableID] = select.map(filter => {
                return {
                    ...filter,
                    status: false,
                };
            });
        },
        updateActions(state, {tableID, tableHash, actions}) {
            if(!state.tablesToUpdate.has(tableHash)) return;

            console.log(state.actions, tableID, actions);
            Object.assign(state.actions[tableID], actions);
        },
        updateNowMode(state, {tableID, tableHash, nowMode}) {
            if(!state.tablesToUpdate.has(tableHash)) return;
            
            state.nowMode[tableID] = nowMode;
        },
        updateEnableMode(state, {tableID, tableHash, enableMode}) {
            if(!state.tablesToUpdate.has(tableHash)) return;

            if(Array.isArray(enableMode)) state.enableMode[tableID] = enableMode;
            else if(state.enableMode[tableID].includes(enableMode)) state.enableMode[tableID].splice(state.enableMode[tableID].indexOf(enableMode), 1);
            else state.enableMode[tableID].push(enableMode);
        },

        sort(state, {tableID, key}) {
            if(state.nowMode[tableID] === 1) return;
            if (state.sortKey[tableID] === key) {
                if(state.sortDir[tableID] < 0) {
                    state.sortKey[tableID] = '';
                } else {
                    state.sortDir[tableID] *= -1;
                }
            } else {
                state.sortKey[tableID] = key;
                state.sortDir[tableID] = 1;
            }
        },
        switchRealAll(state, {tableID, checked}) {
            state.data[tableID].forEach(row => {
                row._selected = checked;
            });
        },
        searchText(state, {tableID, text}) {
            state.searchText[tableID] = text;
        },
        startEditRow(state, {tableID, row}) {
            state.editingRow[tableID] = row;
        },
    },
    actions: {
        // data.state
        async deleteRow(data, {tableID, index}) {
            const isDelete = await data.state.actions[tableID]?.delete(data.state.data[index], index);
            if(isDelete) {
                data.state.data.splice(index, 1);
            }
        },
        async rowInteraction(data, {tableID, operation, $event, rowData, column}) {
            // operation is one of data.state.actions
            const code = await operation($event, data.state.nowMode[tableID], rowData, column);
            // code:
            //   0, null, undefined: do nothing
            //   1: open detail view modal
            console.log(code);
            switch(code) {
                case 1:
                    data.state.viewingRow[tableID] = rowData;
                    break;
            }
        },
        async cellInteraction(data, {tableID, operation, $event, celldata}) {
            // operation is one of data.state.actions
            const code = await operation($event, data.state.nowMode[tableID], celldata);
            // code:
            //   0, null, undefined: do nothing
            //   1: open detail view modal
            console.log(code);
            switch(code) {
                case 1:
                    data.state.viewingRow[tableID] = celldata;
                    break;
            }
        },
        async selectedOperation(data, {tableID, operation, selectedRows}) {
            // operation is one of data.state.select
            const code = await operation?.func(selectedRows);
            const keepSelected = operation.keepSelected ?? false;
            const stateData = data.state.data[tableID];
            // code:
            //   0, null, undefined: do nothing
            //   1, "delete": delete selected rows
            //   2, "start": pick selected rows to start of the data list
            //   3, "end": pick selected rows to end of the data list
            //   4, "reverse": reverse selected rows

            switch(code) {
                case 1:
                    selectedRows.forEach(row => {
                        const index = stateData.indexOf(row);
                        stateData.splice(index, 1);
                    });
                    break;
                case 2:
                    selectedRows.forEach(row => {
                        const index = stateData.indexOf(row);
                        stateData.splice(index, 1);
                    });
                    data.state.data[tableID] = selectedRows.concat(stateData);
                    break;
                case 3:
                    selectedRows.forEach(row => {
                        const index = stateData.indexOf(row);
                        stateData.splice(index, 1);
                    });
                    data.state.data[tableID] = stateData.concat(selectedRows);
                    break;
                case 4:
                    for(let i = 0; i < selectedRows.length/2; i++) {
                        const index0 = stateData.indexOf(selectedRows[i]);
                        const index1 = stateData.indexOf(selectedRows[selectedRows.length-1-i]);
                        const temp = stateData[index0];
                        stateData[index0] = stateData[index1];
                        stateData[index1] = temp;
                    }
                    break;

            }

            if(!keepSelected) {
                stateData.forEach(row => {
                    row._selected = false;
                });
            }
        },
    },
    getters: {
        data: state => tableID => {
            return state.data[tableID];
        },
        selectedData: state => tableID => {
            return state.data[tableID].filter(row => row._selected);
        },
        titleOrder: state => tableID => {
            return state.titleOrder[tableID];
        },

        sortKey: state => tableID => {
            return state.sortKey[tableID];
        },
        sortDir: state => tableID => {
            return state.sortDir[tableID];
        },

        searchText: state => tableID => {
            return state.searchText[tableID];
        },
        currentPage: state => tableID => {
            return state.currentPage[tableID];
        },
        pageSize: state => tableID => {
            return state.pageSize[tableID];
        },

        nowMode: state => tableID => {
            return state.nowMode[tableID];
        },
        enableMode: state => tableID => {
            return state.enableMode[tableID];
        },

        // operations
        filters: state => tableID => {
            return state.filters[tableID];
        },
        select: state => tableID => {
            return state.select[tableID];
        },
        actions: state => tableID => {
            return state.actions[tableID];
        },

        // modal
        editingRow: state => tableID => {
            return state.editingRow[tableID];
        },
        viewingRow: state => tableID => {
            return state.viewingRow[tableID];
        },
        showFloating: state => tableID => {
            return state.viewingRow[tableID] || state.editingRow[tableID];
        },

        cells: state => tableID => {
            return state.cells[tableID];
        },
        dragObj: state => tableID => {
            return state.dragObj[tableID];
        },
    }
});