import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    let disabledButtonClass = "top5-button-disabled";
    function handleUndo() {
        store.undo();
        store.updateButtons();
    }
    function handleRedo() {
        store.redo();
        store.updateButtons();
    }
    function handleClose() {
        history.push("/");
        store.closeCurrentList();
        store.updateButtons();
    }
    let editStatus = false;
    if (store.isListNameEditActive) {
        editStatus = true;
    }
    return (
        <div id="edit-toolbar">
            <div
                disabled={editStatus}
                id='undo-button'
                onClick={handleUndo}
                className={disabledButtonClass}>
                &#x21B6;
            </div>
            <div
                disabled={editStatus}
                id='redo-button'
                onClick={handleRedo}
                className={disabledButtonClass}>
                &#x21B7;
            </div>
            <div
                disabled={editStatus}
                id='close-button'
                onClick={handleClose}
                className={disabledButtonClass}>
                &#x24E7;
            </div>
        </div>
    )
}

export default EditToolbar;