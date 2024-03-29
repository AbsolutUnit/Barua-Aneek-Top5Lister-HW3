import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api, { deleteTop5ListById } from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import ChangeItem_Transaction from '../transactions/ChangeItem_Transaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    ADD_NEW_LIST: "ADD_NEW_LIST",
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    LIST_MARKED_FOR_DELETE: "LIST_MARKED_FOR_DELETE"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: [0],
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                document.getElementById("close-button").className = "top5-button-disabled";
                document.getElementById("close-button").disabled = true;
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                document.getElementById("close-button").className = "top5-button";
                document.getElementById("close-button").disabled = false;
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            case GlobalStoreActionType.ADD_NEW_LIST: {
                return setStore({
                    idNamePairs: payload,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            case GlobalStoreActionType.INCREMENT_LIST_COUNT: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: false,
                    newListCounter: payload
                })
            }
            case GlobalStoreActionType.LIST_MARKED_FOR_DELETE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: payload,
                    newListCounter: store.newListCounter
                })
            }
            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                console.log("success 1");
                let top5List = response.data.top5List;
                top5List.name = newName;
                async function updateList(top5List) {
                    try {
                        response = await api.updateTop5ListById(top5List._id, top5List);
                        if (response.data.success) {
                            console.log("success 2");
                            async function getListPairs(top5List) {
                                response = await api.getTop5ListPairs();
                                if (response.data.success) {
                                    let pairsArray = response.data.idNamePairs;
                                    storeReducer({
                                        type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                        payload: {
                                            idNamePairs: pairsArray,
                                            top5List: top5List
                                        }
                                    });
                                } 
                            }
                            getListPairs(top5List);
                        } else {
                            async function getListPairs(top5List) {
                                try {
                                    response = await api.getTop5ListPairs();
                                    if (response.data.success) {
                                        let pairsArray = response.data.idNamePairs;
                                        storeReducer({
                                            type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                            payload: {
                                                idNamePairs: pairsArray,
                                                top5List: top5List
                                            }
                                        });
                                    } 
                                } catch (error) {
                                    storeReducer({
                                        type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                        payload: {
                                            idNamePairs: store.idNamePairs,
                                            top5List: top5List
                                        }
                                    });
                                } 
                            }
                        }
                    } catch (err0r) {
                        storeReducer({
                            type: GlobalStoreActionType.CHANGE_LIST_NAME,
                            payload: {
                                idNamePairs: store.idNamePairs,
                                top5List: top5List
                            }
                        });
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getTop5ListPairs();
            let pairsArray = [];
            try {
                const resp = await api.getTop5ListPairs();
                if (resp.data.success){
                    pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
            }
            catch (error) {
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
        store.updateButtons();
    }
    store.addEditItemTransaction = function (ind, init, end) {
        let transaction = new ChangeItem_Transaction(store, ind, init, end);
        tps.addTransaction(transaction);
        store.updateButtons();
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.editItem = function (id, text) {
        store.currentList.items[id] = text;
        store.updateCurrentList();
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }

    store.updateButtons = function () {
        if (!(tps.hasTransactionToUndo())){
            document.getElementById("undo-button").className = "top5-button-disabled";
            document.getElementById("undo-button").disabled = true;
        } else {
            document.getElementById("undo-button").className = "top5-button";
            document.getElementById("undo-button").disabled = false;
        }
        if (!(tps.hasTransactionToRedo())){
            document.getElementById("redo-button").className = "top5-button-disabled";
            document.getElementById("redo-button").disabled = true;
        } else {
            document.getElementById("redo-button").className = "top5-button";
            document.getElementById("redo-button").disabled = false;
        }
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    store.addNewList = function () {
        async function asyncCreateNewList() {
            const resp = await api.createTop5List({
                "name": "Untitled" + store.newListCounter,
                "items": ["?", "?", "?", "?", "?"]
            })
            store.setCurrentList(resp.data.top5List._id)
            store.newListCounter[0] = store.newListCounter[0] + 1;
        }
        asyncCreateNewList();
    }

    store.setMarkedForDeletion = function (idNamePair) {
        storeReducer({
            type: GlobalStoreActionType.LIST_MARKED_FOR_DELETE,
            payload: idNamePair
        });
    }

    store.deleteMarkedList = function () {
        async function deleteMarkedListAsync() {
            try{
                let resp = await deleteTop5ListById(store.listMarkedForDeletion._id)
                store.loadIdNamePairs();
            } catch (error) {
                store.loadIdNamePairs();
            }
        }
        deleteMarkedListAsync();
    }

    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}