import {ListState} from "../reducers/lists.reducers";
import {createSelector} from "@ngrx/store";
import {AppState} from "../reducers";

export const getListState = (state: AppState) => state.lists;

export const getAllLists = createSelector(getListState, (state: ListState) => state.data);
export const getListById = createSelector(getListState, (state: ListState, props: { id: string }) => state.data.find(list => list.id == props.id));
