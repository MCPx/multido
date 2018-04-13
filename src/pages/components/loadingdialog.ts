import { Component } from '@angular/core';
import { LoadingController, Loading } from 'ionic-angular';

@Component({selector: 'component-loader'})
export class LoadingDialog {

    loadingDialog: Loading;

    constructor(private loadingCtrl: LoadingController){}

    public present(text: string, options?: object)
    {
        this.loadingDialog = this.loadingCtrl.create({
            content: text || "Loading...",
            ...options
        });

        this.loadingDialog.present();
    }

    public dismiss()
    {
        this.loadingDialog.dismiss();
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
duration	            number	    How many milliseconds to wait before hiding the indicator. By default, it will show until dismiss() is called.
*/
