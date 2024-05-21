sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/HashChanger"
  ],
  function (Controller, HashChanger) {
    "use strict";

    return Controller.extend("sap.fiori.asncreationsa.controller.App", {
    //   doRoute: function () {
    //     this.router = sap.ui.core.UIComponent.getRouterFor(this);
    //     this.Component = this.getOwnerComponent().getComponentData();
    //     HashChanger.getInstance().replaceHash("");
    //     this.router.initialize();
    //   },
    //   onInit: function () {
    //     var site = window.location.href.includes("site");
    //     if (site) {
    //       var slash = site ? "/" : "";
    //       var modulePath = jQuery.sap.getModulePath("sap/fiori/asncreationsa");
    //       modulePath = modulePath === "." ? "" : modulePath;
    //       $.ajax({
    //         url: modulePath + slash + "user-api/attributes",
    //         type: "GET",
    //         success: res => {
    //           if (!sessionStorage.getItem('AddressCodeASNSA')) {
    //             sessionStorage.setItem('AddressCodeASNSA', res.login_name[0]);
    //           }
    //           this.setHeaders(res.login_name[0], res.type[0].substring(0, 1).toUpperCase());
              
    //         }
    //       });
    //     } else {
    //       this.setHeaders("RA046 ", "E");
    //     }
    //   },
    //   setHeaders: function (loginId, loginType) {
    //     this.getView().getModel().setHeaders({
    //         "loginId": loginId,
    //         "loginType": loginType
    //     });

    //     // enable routing
    //     this.doRoute();
    // },
    });
  }
);
