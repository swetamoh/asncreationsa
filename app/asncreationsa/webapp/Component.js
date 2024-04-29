/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/model/odata/ODataModel",
    "sap/fiori/asncreationsa/controller/formatter",
    "sap/ui/Device",
    "sap/fiori/asncreationsa/model/models",
    "sap/ui/core/routing/HashChanger"
],
    function (UIComponent, MessageBox, ODataModel, formatter, Device, models, HashChanger) {
        "use strict";

        return UIComponent.extend("sap.fiori.asncreationsa.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
                var slash = window.location.href.includes("site") ? "/" : "";
                var modulePath = jQuery.sap.getModulePath("sap/fiori/asncreationsa");
                modulePath = modulePath === "." ? "" : modulePath;
                var serviceUrl = modulePath + slash + this.getMetadata().getManifestEntry("sap.app").dataSources.mainService.uri;
                var oDataModel = new ODataModel(serviceUrl, true);

                // metadata failed
                oDataModel.attachMetadataFailed(err => {
                    var response = err.getParameter("response").body;
                    if (response.indexOf("<?xml") !== -1) {
                        MessageBox.error($($.parseXML(response)).find("message").text());
                    } else {
                        MessageBox.error(response);
                    }
                });

                oDataModel.attachMetadataLoaded(() => {
                    this.setModel(oDataModel);
                    sap.ui.getCore().setModel(oDataModel, "oDataModel");
                    oDataModel.setDefaultCountMode("None");

                    var pItemModel = new sap.ui.model.json.JSONModel();
                    sap.ui.getCore().setModel(pItemModel, "pItemModel");

                    // set the device model
                    this.setModel(models.createDeviceModel(), "device");
                    var site = window.location.href.includes("site");
                    if (site) {
                        $.ajax({
                            url: modulePath + slash + "user-api/attributes",
                            type: "GET",
                            success: res => {
                                if (!sessionStorage.getItem('AddressCodeASNSA')) {
                                    sessionStorage.setItem('AddressCodeASNSA', res.login_name[0]);
                                }
                                this.setHeaders(res.login_name[0], res.type[0].substring(0, 1).toUpperCase());

                            }
                        });
                    } else {
                        this.setHeaders("RA046 ", "E");
                    }
                });

                // odata request failed
                oDataModel.attachRequestFailed(err => {
                    var responseText = err.getParameter("responseText");
                    if (responseText.indexOf("<?xml") !== -1) {
                        MessageBox.error($($.parseXML(responseText)).find("message").text());
                    } else {
                        MessageBox.error(JSON.parse(responseText).error.message.value);
                    }
                });
            },
            setHeaders: function (loginId, loginType) {
                this.getModel().setHeaders({
                    "loginId": loginId,
                    "loginType": loginType
                });
        
                // enable routing
                HashChanger.getInstance().replaceHash("");
                this.getRouter().initialize();
            },
        });
    }
);