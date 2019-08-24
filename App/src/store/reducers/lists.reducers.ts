import * as listActions from "../actions/lists.actions";
import {List} from "models/list";

export interface ListState {
    selectedListId: string,
    data: List[];
}

export const initialState: ListState = {
    selectedListId: null,
    data: []
};

export function reducer(state = initialState, action: listActions.AnyAction): ListState {
    switch (action.type) {
        case listActions.ActionTypes.UpdateLists: {
            return {
                ...state,
                data: action.payload.lists
            };
        }
        case listActions.ActionTypes.AddList: {
            return {
                ...state,
                data: [...state.data, action.payload.list]
            };
        }
        case listActions.ActionTypes.RemoveList: {
            return {
                ...state,
                data: state.data.filter(list => list.id !== action.payload.id)
            };
        }
        case listActions.ActionTypes.SelectList: {
            return {
                ...state,
                selectedListId: action.payload.id
            }
        }

        default:
            return state;
    }
}
