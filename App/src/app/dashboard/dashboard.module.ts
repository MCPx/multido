import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DashBoardPage } from "./dashboard.page";

const routes: Routes = [
    {
        path: '',
        component: DashBoardPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [DashBoardPage]
})
export class DashBoardPageModule {
}
