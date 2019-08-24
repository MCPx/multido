import {
    ActionReducer,
    ActionReducerMap,
    createFeatureSelector,
    createSelector,
    MetaReducer
} from '@ngrx/store';

import * as listReducers from "./lists.reducers";

export interface AppState {
    lists: listReducers.ListState;
}

export const reducers: ActionReducerMap<AppState> = {
    lists: listReducers.reducer
};

export const metaReducers: MetaReducer<AppState>[] = [];

export const getListState = (state: AppState) => state.lists;

export const getAllLists = createSelector(getListState, listReducers.getLists);
export const getListById = createSelector(getListState, listReducers.getListById);