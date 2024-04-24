sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Filter, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.asncreationsa.controller.SAMaster", {

		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this.filterModel = new sap.ui.model.json.JSONModel();
			this.listTemp = this.byId("idlistitem").clone();
			// this.getView().byId("plantFilterId").setText();
			this.DataModel = new sap.ui.model.json.JSONModel();
			this.DataModel.setSizeLimit(10000000);
			this.getView().setModel(this.DataModel, "DataModel");

		},

		onRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") !== "SAMaster") {
				return;
			}
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "ddMMMyyyy"
			});
			this.ASNtodate = new Date();
			this.ASNfromdate = new Date(this.ASNtodate.getTime() - 30 * 24 * 3600 * 1000);
			this.ASNtodate = dateFormat1.format(this.ASNtodate);
			this.ASNfromdate = dateFormat1.format(this.ASNfromdate);
			this.ASNtodate = this.ASNtodate.substring(0, 2) + " " + this.ASNtodate.substring(2, 5) + " " + this.ASNtodate.substring(5, 9);
			this.ASNfromdate = this.ASNfromdate.substring(0, 2) + " " + this.ASNfromdate.substring(2, 5) + " " + this.ASNfromdate.substring(5, 9);

			this.unitCode = sessionStorage.getItem("unitCode") || "P01";
			this.AddressCodeASNSA = sessionStorage.getItem("AddressCodeASNSA") || 'JSE-01-01';
			this.LoggedUser = sessionStorage.getItem("LoggedUser") || "rajeshsehgal@impauto.com";
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/GetASNHeaderList", {
				urlParameters: {
					username: this.LoggedUser,
					AddressCode: this.AddressCodeASNSA,
					PoNumber: '',
					ASNNumber: '',
					ASNFromdate: this.ASNfromdate,
					ASNTodate: this.ASNtodate,
					InvoiceStatus: '',
					MRNStatus: '',
					ApprovedBy: ''
				},
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.PlantCode = oData.results[0].PlantCode;
					that.ASNStatus = oData.results[0].ASNStatus;
					that.DataModel.setData(oData);
					that.DataModel.refresh();
					that.routeToDetail();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var value = JSON.parse(oError.response.body);
					MessageBox.error(value.error.message.value);
				}
			});
		},

		routeToDetail: function () {
			// this.byId("masterListId").getBinding("items").attachDataReceived(() => {
			var selectedItem = this.byId("masterListId").getItems()[0];
			this.byId("masterListId").setSelectedItem(selectedItem, true);
			if (selectedItem) {
				this.AsnNumber = selectedItem.getProperty("title").replace(/\//g, '-');
				this.router.navTo("SADetail", {
					"AsnNumber": this.AsnNumber,
					"AddressCode": this.AddressCodeASNSA,
					"UnitCode": this.PlantCode,
					"ASNStatus": this.ASNStatus
				});
			} else {
				this.router.navTo('NoData');
			}
			// });
		},

		onListItemPress: function (oEvent) {
			var data = oEvent.getParameter("listItem").getBindingContext("DataModel").getProperty();
			var AsnNumber = oEvent.getParameter("listItem").getProperty("title").replace(/\//g, '-');
			this.router.navTo("SADetail", {
				"AsnNumber": AsnNumber,
				"AddressCode": this.AddressCodeASNSA,
				"UnitCode": data.PlantCode,
				"ASNStatus": data.ASNStatus
			});
		},

		onSearch: function (evt) {
			if (evt.getParameter("refreshButtonPressed") === true) {
				this.getView().byId("masterListId").getBinding("items").refresh(true);
			} else {
				sap.ui.core.BusyIndicator.show();
				var sValue = evt.getParameter("query");
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/GetASNHeaderList", {
					urlParameters: {
						"search": sValue,
						username: this.LoggedUser,
						AddressCode: this.AddressCodeASNSA,
						PoNumber: '',
						ASNNumber: '',
						ASNFromdate: this.ASNfromdate,
						ASNTodate: this.ASNtodate,
						InvoiceStatus: '',
						MRNStatus: '',
						ApprovedBy: ''
					},
					success: function (oData) {
						sap.ui.core.BusyIndicator.hide();
						this.PlantCode = oData.results[0].PlantCode;
						that.DataModel.setData(oData);
						that.DataModel.refresh();
						this.routeToDetail();
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
					}
				});
			}
		},

		onFilter: function () {
			if (!this.filterFragment) {
				this.filterFragment = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.filterFragment", this);
				this.filterFragment.setModel(this.filterModel, "filterModel");

			}
			this.filterVisibleModel = new sap.ui.model.json.JSONModel({
				Werks: true,
				Status: true,
			});

			this.filterFragment.setModel(this.filterVisibleModel, "FilterVisibleModel");
			this.filterFragment.open();
		},
		onPlantValueHelp: function () {
			if (!this.PlantF4Frag) {
				this.PlantF4Frag = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.PlantFrag", this);
				this.PlantF4Temp = sap.ui.getCore().byId("plantTempId").clone();
			}
			this.PlantF4Frag.setModel(new JSONModel(JSON.parse(sessionStorage.getItem("CodeDetails"))), "plantModel");
			this.getView().addDependent(this.PlantF4Frag);
			// sap.ui.getCore().byId("plantF4Id").bindAggregation("items", {
			// 	path: this.plantModel,
			// 	template: this.PlantF4Temp
			// });
			sap.ui.getCore().byId("plantF4Id")._searchField.setVisible(false);
			this.PlantF4Frag.open();
		},

		handlePlantClose: function (oEvent) {
			var data = oEvent.getParameter("selectedItem").getProperty("title");
			this.desc = oEvent.getParameter("selectedItem").getProperty("description");
			this.filterModel.getData().Werks = data;
			this.filterModel.refresh("true");
			//sessionStorage.setItem("unitCode", data);
			this.PlantF4Frag.destroy();
			this.PlantF4Frag = "";
			//this.getData();
		},

		handlePlantCancel: function () {
			this.PlantF4Frag.destroy();
			this.PlantF4Frag = "";
		},
		// onStatusValueHelp: function () {
		// 	if (!this.StatusF4Frag) {
		// 		this.StatusF4Frag = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.StatusFrag", this);
		// 		this.StatusF4Temp = sap.ui.getCore().byId("statusTempId").clone();
		// 	}
		// 	var statusData = [
		// 		{
		// 			status: "Invoice Submitted"
		// 		},{
		// 			status: "Invoice Submission Pending"
		// 		}
		// 	];
		// 	this.StatusF4Frag.setModel(new JSONModel(statusData), "statusModel");
		// 	this.getView().addDependent(this.StatusF4Frag);
		// 	// sap.ui.getCore().byId("plantF4Id").bindAggregation("items", {
		// 	// 	path: this.plantModel,
		// 	// 	template: this.PlantF4Temp
		// 	// });
		// 	sap.ui.getCore().byId("statusF4Id")._searchField.setVisible(false);
		// 	this.StatusF4Frag.open();
		// },

		// handleStatusClose: function (oEvent) {
		// 	var data = oEvent.getParameter("selectedItem").getProperty("title");
		// 	this.StatusF4Frag.destroy();
		// 	this.StatusF4Frag = "";
		// 	var unitCode = sessionStorage.getItem("unitCode");
		// 	this.getView().byId("masterListId").bindItems({
		// 		path: "/PurchaseOrders?search=" + data,
		// 		parameters: {
		// 			custom: {
		// 				AddressCode: this.AddressCodePO,
		// 				UnitCode: unitCode
		// 			}
		// 		},
		// 		template: this._listTemp
		// 	});
		// 	this._getFirstItem();
		// },

		// handleStatusCancel: function () {
		// 	this.StatusF4Frag.destroy();
		// 	this.StatusF4Frag = "";
		// },
		onFilterSubmit: function () {
			var data = this.filterModel.getData();

			this.AddressCodePO = sessionStorage.getItem("AddressCodePO") || 'JSE-01-01';
			var Status = data.Status;
			var unitCode = data.Werks;

			if (!unitCode) {
				unitCode = sessionStorage.getItem("unitCode") || "P01";
			}

			if (!Status) {
				this.getView().byId("masterListId").bindItems({
					path: "/PurchaseOrders",
					parameters: {
						custom: {
							AddressCode: this.AddressCodePO,
							UnitCode: unitCode
						},
						countMode: 'None'
					},
					template: this._listTemp
				});
			} else {
				this.getView().byId("masterListId").bindItems({
					path: "/PurchaseOrders?search=" + Status,
					parameters: {
						custom: {
							AddressCode: this.AddressCodePO,
							UnitCode: unitCode
						}
					},
					template: this._listTemp
				});
			}
			if (data.Werks) {
				this.PlantFilter = unitCode + "(" + this.desc + ")";
				this.getView().byId("plantFilterId").setText(this.PlantFilter);
			}
			this.getView().byId("clearFilterId").setVisible(true);
			// this.filterModel.setData({});
			this.filterFragment.close();
			this.filterFragment.destroy();
			this.filterFragment = "";
			this.routeToDetail();
		},
		onFilterCancel: function () {
			this.filterFragment.close();
			this.filterFragment.destroy();
			this.filterFragment = "";
		},
		onFilterClear: function () {
			this.getView().byId("clearFilterId").setVisible(false);
			this.getView().byId("plantFilterId").setText("");
			var unitCode = sessionStorage.getItem("unitCode") || "P01";
			this.AddressCodePO = sessionStorage.getItem("AddressCodePO") || 'JSE-01-01';
			this.getView().byId("masterListId").bindItems({
				path: "/PurchaseOrders",
				parameters: {
					custom: {
						AddressCode: this.AddressCodePO,
						UnitCode: unitCode
					},
					countMode: 'None'
				},
				template: this._listTemp
			});
			this.routeToDetail();
		},
	});
});