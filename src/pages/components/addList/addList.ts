import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";

interface AddListModel{
    name : string;
}

@Component({selector: 'page-addcollection', templateUrl: 'addList.html'})
export class AddListPage
{
    addListModel : AddListModel = { name: undefined };

    isValid() {
        return this.addListModel.name && this.addListModel.name.length > 0;
    }

    constructor(public viewCtrl: ViewController, private params: NavParams) {
        this.addListModel.name = params.get("name");
    }

    save() {
        this.viewCtrl.dismiss(this.addListModel);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}