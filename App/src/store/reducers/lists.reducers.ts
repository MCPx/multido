import * as listActions from "../actions/lists.actions";
import {List} from "models/list";

export interface ListState {
    data: List[];
}

export const initialState: ListState = {
    data: []
};

export function reducer(state = initialState, action: listActions.ActionsUnion): ListState {
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

        default:
            return state;
    }
}
