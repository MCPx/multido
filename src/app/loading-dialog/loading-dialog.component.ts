import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-loading-dialog'
})
export class LoadingDialogComponent implements OnInit {

    loadingDialog: HTMLIonLoadingElement;

    constructor(private loadingCtrl: LoadingController) {
    }

    ngOnInit() {
    }

    public async present(text: string, options?: object) {
        this.loadingDialog = await this.loadingCtrl.create({
            message: text || 'Loading...',
            ...options
        });

        return await this.loadingDialog.present();
    }

    public async dismiss() {
        if (this.loadingDialog) {
            await this.loadingDialog.dismiss();
        }
    }

}

/*
-------
OPTIONS
-------
spinner	                string	    The name of the SVG spinner for the loading indicator. "hide" to hide
content	                string	    The html content for the loading indicator.
cssClass	            string	    Additional classes for custom styles, separated by spaces.
showBackdrop	        boolean	    Whether to show the backdrop. Default true.
enableBackdropDismiss	boolean	    Whether the loading indicator should be dismissed by tapping the backdrop. Default false.
dismissOnPageChange	    boolean	    Whether to dismiss the indicator when navigating to a new page. Default false.
duration	            number	    How many milliseconds to wait before hiding the indicator. By default,
 it will show until dismiss() is called.
*/

