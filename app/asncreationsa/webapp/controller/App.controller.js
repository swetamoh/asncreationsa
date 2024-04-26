sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/HashChanger"
  ],
  function (Controller, HashChanger) {
    "use strict";

    return Controller.extend("sap.fiori.asncreationsa.controller.App", {
      doRoute: function () {
        this.router = sap.ui.core.UIComponent.getRouterFor(this);
        this.Component = this.getOwnerComponent().getComponentData();
        HashChanger.getInstance().replaceHash("");
        this.router.initialize();
      },
      onInit: function () {
        var site = window.location.href.includes("site");
        if (site) {
          var slash = site ? "/" : "";
          var modulePath = jQuery.sap.getModulePath("sap/fiori/asncreationsa");
          modulePath = modulePath === "." ? "" : modulePath;
          $.ajax({
            url: modulePath + slash + "user-api/attributes",
            type: "GET",
            success: res => {
              if (res.login_name[0] !== res.email) {
                sessionStorage.setItem('AddressCodeASNSA', res.login_name[0]);
              } else {
                sessionStorage.setItem('AddressCodeASNSA', 'JSE-01-01');
              }
              this.setHeaders(res.email, res.type[0].substring(0, 1).toUpperCase());
              
            }
          });
        } else {
          this.setHeaders("rajeshsehgal@impauto.com", "E");
        }
      },
      setHeaders: function (loginId, loginType) {
        this.getView().getModel().setHeaders({
            "loginId": loginId,
            "loginType": loginType
        });

        // enable routing
        this.doRoute();
    },
    });
  }
);
