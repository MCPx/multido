import { Component } from "@angular/core";
import { ViewController } from "ionic-angular";

interface AddListModel{
    name : string;
}

@Component({selector: 'page-addcollection', templateUrl: 'addList.html'})
export class AddListPage
{
    addListModel : AddListModel = { name: null };

    isValid() {
        return this.addListModel.name !== null;
    }

    constructor(public viewCtrl: ViewController){
    }

    save() {
        this.viewCtrl.dismiss(this.addListModel);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}