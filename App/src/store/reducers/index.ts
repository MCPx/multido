import {
    ActionReducer,
    ActionReducerMap,
    createFeatureSelector,
    createSelector,
    MetaReducer
} from '@ngrx/store';

import * as listReducers from "./lists.reducers";
import * as userReducers from "./user.reducers";

export interface AppState {
    lists: listReducers.ListState;
    user: userReducers.UserState;
}

export const reducers: ActionReducerMap<AppState> = {
    lists: listReducers.reducer,
    user: userReducers.reducer
};

export const metaReducers: MetaReducer<AppState>[] = [];
