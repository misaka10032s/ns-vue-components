import { createStore } from 'vuex'
import { HTTPreq } from '@/js/NSHTTPreq.js'
import { chatEX } from '@/js/NSchatEX.js'
import Swal from 'sweetalert2'

import { def } from '@vue/shared'

export default createStore({
    state () {
        return {
            data: [],
            titleOrder: [
                // "String"
                // or
                // {
                //    key: "String",
                //    text: "String",
                // }
            ],

            sortKey: '',
            sortDir: 1,
            
            searchText: '',
            currentPage: 1,
            pageSize: 10,

            // 0: view, 1: edit, 2: select, 3: switch
            nowMode: 1,

            filters: [
                // {
                //    id: String,
                //    name: String,
                //    func: Function,
                //    icon: String (optional, in class of <i> tag)
                //    image: String (optional, in src of <img> tag)
                //    text: String (optional, in class of <span> tag)
                //    group: String (optional, in class of <div> tag)
                //    status: Boolean (auto generated)
                // }
            ],
            select: [
                // same as filters, but no group
            ], 
            actions: {
                click: ($event, nowMode, rowData, col) => {},
                contextmenu: ($event, nowMode, rowData, col) => {},
                nodata: () => {},
            },

            editingRow: null,
            viewingRow: null,

            // for list table
            cells: [],
            dragObj: [],
        }
    },
    mutations: {
        sort(state, key) {
            if(state.nowMode === 1) return;
            if (state.sortKey === key) {
                if(state.sortDir < 0) {
                    state.sortKey = '';
                } else {
                    state.sortDir *= -1;
                }
            } else {
                state.sortKey = key;
                state.sortDir = 1;
            }
        },
    },
    actions: {
        // data.state
        async deleteRow(data, index) {
            const isDelete = await data.state.actions?.delete(data.state.data[index], index);
            if(isDelete) {
                data.state.data.splice(index, 1);
            }
        },
        async rowInteraction(data, {operation, $event, rowData, column}) {
            // operation is one of data.state.actions
            const code = await operation($event, data.state.nowMode, rowData, column);
            // code:
            //   0, null, undefined: do nothing
            //   1: open detail view modal
            console.log(code);
            switch(code) {
                case 1:
                    data.state.viewingRow = rowData;
                    break;
            }
        },
        async cellInteraction(data, {operation, $event, celldata}) {
            // operation is one of data.state.actions
            const code = await operation($event, data.state.nowMode, celldata);
            // code:
            //   0, null, undefined: do nothing
            //   1: open detail view modal
            console.log(code);
            switch(code) {
                case 1:
                    data.state.viewingRow = celldata;
                    break;
            }
        },
        async selectedOperation(data, {operation, selectedRows}) {
            // operation is one of data.state.select
            const code = await operation?.func(selectedRows);
            const keepSelected = operation.keepSelected ?? false;
            // code:
            //   0, null, undefined: do nothing
            //   1, "delete": delete selected rows
            //   2, "start": pick selected rows to start of the data list
            //   3, "end": pick selected rows to end of the data list
            //   4, "reverse": reverse selected rows

            switch(code) {
                case 1:
                    selectedRows.forEach(row => {
                        const index = data.state.data.indexOf(row);
                        data.state.data.splice(index, 1);
                    });
                    break;
                case 2:
                    selectedRows.forEach(row => {
                        const index = data.state.data.indexOf(row);
                        data.state.data.splice(index, 1);
                    });
                    data.state.data = selectedRows.concat(data.state.data);
                    break;
                case 3:
                    selectedRows.forEach(row => {
                        const index = data.state.data.indexOf(row);
                        data.state.data.splice(index, 1);
                    });
                    data.state.data = data.state.data.concat(selectedRows);
                    break;
                case 4:
                    for(let i = 0; i < selectedRows.length/2; i++) {
                        const index0 = data.state.data.indexOf(selectedRows[i]);
                        const index1 = data.state.data.indexOf(selectedRows[selectedRows.length-1-i]);
                        const temp = data.state.data[index0];
                        data.state.data[index0] = data.state.data[index1];
                        data.state.data[index1] = temp;
                    }
                    break;

            }

            if(!keepSelected) {
                data.state.data.forEach(row => {
                    row._selected = false;
                });
            }
        },
    },
    getters: {
        data: state => {
            return state.data;
        },
        selectedData: state => {
            return state.data.filter(row => row._selected);
        },
        titleOrder: state => {
            return state.titleOrder;
        },

        sortKey: state => {
            return state.sortKey;
        },
        sortDir: state => {
            return state.sortDir;
        },

        searchText: state => {
            return state.searchText;
        },
        currentPage: state => {
            return state.currentPage;
        },
        pageSize: state => {
            return state.pageSize;
        },

        nowMode: state => {
            return state.nowMode;
        },

        filters: state => {
            return state.filters;
        },
        select: state => {
            return state.select;
        },
        actions: state => {
            return state.actions;
        },

        editingRow: state => {
            return state.editingRow;
        },
        viewingRow: state => {
            return state.viewingRow;
        },

        cells: state => {
            return state.cells;
        },
        dragObj: state => {
            return state.dragObj;
        },
    }
});