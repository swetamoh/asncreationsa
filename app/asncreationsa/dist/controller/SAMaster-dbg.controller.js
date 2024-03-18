sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (Controller, JSONModel, Filter) {
	"use strict";

	return Controller.extend("sap.fiori.asncreationsa.controller.SAMaster", {

		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
			this.filterModel = new sap.ui.model.json.JSONModel();
			this.listTemp = this.byId("idlistitem").clone();
			
			
		},

		onRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") !== "SAMaster") {
				return;
			}
			// var filter = [new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")];
			// if (sap.ui.getCore().getModel("filterModel").getData().Vendor_No) {
			// 	filter.push(new sap.ui.model.Filter("Vendor_No", "EQ", sap.ui.getCore().getModel("filterModel").getData().Vendor_No));
			// }
			this.unitCode = sessionStorage.getItem("unitCode") || "P01";
			this.AddressCodeASNSA = sessionStorage.getItem("AddressCodeASNSA") || 'JSE-01-01';
			this.byId("masterListId").bindAggregation("items", {
				path: "/SchedulingAgreements",
				parameters: {
					custom: {
						AddressCode: this.AddressCodeASNSA,
						UnitCode: this.unitCode
					},
					countMode: 'None'
				},
				// filters: filter,
				template: this.listTemp
			});
			this.routeToDetail();
		},

		routeToDetail: function () {
			this.byId("masterListId").getBinding("items").attachDataReceived(() => {
				var selectedItem = this.byId("masterListId").getItems()[0];
				this.byId("masterListId").setSelectedItem(selectedItem, true);
				var SchNum = selectedItem.getProperty("title").replace(/\//g,'-');
				if (selectedItem) {
					this.router.navTo("SADetail", {
						"Schedule_No": SchNum
					});
				} else {
					this.router.navTo('NoData');
				}
			});
		},

		onSupplierValueHelp: function () {
			var spDialog = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.SuppF4", this);
			this.getView().addDependent(spDialog);
			this.oTemplate = sap.ui.getCore().byId("suppF4Temp").clone();
			// var bukrs = sessionStorage.getItem("compCode") || "";
			sap.ui.getCore().byId("suppF4").bindAggregation("items", {
				path: "/SupplierHelpSet",
				// filters: [
				// 	new sap.ui.model.Filter("Bukrs", "EQ", bukrs)
				// ],
				template: this.oTemplate
			});
			spDialog.open();
		},

		onSuppF4Search: function (evt) {
			var sValue = evt.getParameter("value");
			var sp = sValue ? { custom: { search: sValue } } : "";
			// var bukrs = sessionStorage.getItem("compCode") || "";
			sap.ui.getCore().byId("suppF4").bindAggregation("items", {
				path: "/SupplierHelpSet",
				// filters: [
				// 	new sap.ui.model.Filter("Bukrs", "EQ", bukrs)
				// ],
				parameters: sp,
				template: this.oTemplate
			});
		},

		onSuppF4Confirm: function (evt) {
			evt.getSource().destroy();
			sap.ui.getCore().getModel("filterModel").getData().Vendor_No = evt.getParameter("selectedItem").getTitle();
			sap.ui.getCore().getModel("filterModel").refresh("true");
		},

		onSuppF4Close: function (evt) {
			evt.getSource().destroy();
		},

		onListItemPress: function (oEvent) {
			var SchNo = oEvent.getParameter("listItem").getProperty("title");
			var SchNum = SchNo.replace(/\//g, '-');
			this.router.navTo("SADetail", {
				"Schedule_No": SchNum
			});
		},

		onSearch: function (evt) {
			if (evt.getParameter("refreshButtonPressed") === true) {
				this.getView().byId("masterListId").getBinding("items").refresh(true);
			} else {
				var sValue = evt.getParameter("query");
				var sp = sValue ? { custom: { search: sValue } } : "";
				// var filter = [new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")];
				// if (sap.ui.getCore().getModel("filterModel").getData().Vendor_No) {
				// 	filter.push(new sap.ui.model.Filter("Vendor_No", "EQ", sap.ui.getCore().getModel("filterModel").getData().Vendor_No));
				// }
				this.byId("masterListId").bindAggregation("items", {
					path: "/SchedulingAgreements?search=" + sValue,
					parameters: {
						custom: {
							unitCode: this.unitCode
						}
					},
					// filters: filter,
					template: this.listTemp
				});
			}
			this.routeToDetail();
		},

		onFilter: function () {
			if (!this.filterFragment) {
				this.filterFragment = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.filterFragment", this);
				this.filterFragment.setModel(sap.ui.getCore().getModel("filterModel"), "filterModel");
			}
			// if (this.getView().getModel().getHeaders().LoginType === "E") {
			// 	this.filterVisibleModel = new JSONModel({
			// 		Matnr: true,
			// 		Werks: true,
			// 		Vendor_No: true
			// 	});
			// } else {
			// 	this.filterVisibleModel = new JSONModel({
			// 		Matnr: true,
			// 		Werks: true,
			// 		Vendor_No: false
			// 	});
			// }
			this.filterFragment.open();
			// this.filterFragment.setModel(this.filterVisibleModel, "FilterVisibleModel");
		},

		onPlantValueHelp: function () {
			if (!this.PlantF4Frag) {
				this.PlantF4Frag = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.PlantFrag", this);
				this.PlantF4Temp = sap.ui.getCore().byId("plantTempId").clone();
			}
			this.getView().addDependent(this.PlantF4Frag);
			sap.ui.getCore().byId("plantF4Id").bindAggregation("items", {
				path: "/PlantHelpSet",
				template: this.PlantF4Temp
			});
			this.PlantF4Frag.open();
		},

		handlePlantSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var sp = sValue ? { custom: { search: sValue } } : "";
			sap.ui.getCore().byId("plantF4Id").bindAggregation("items", {
				path: "/PlantHelpSet",
				parameters: sp,
				template: this.PlantF4Temp
			});
		},

		handlePlantClose: function (oEvent) {
			var data = oEvent.getParameter("selectedItem").getBindingContext().getObject();
			sap.ui.getCore().getModel("filterModel").getData().Werks = data.Werks;
			sap.ui.getCore().getModel("filterModel").refresh("true");
			this.PlantF4Frag.destroy();
			this.PlantF4Frag = "";
		},

		handlePlantCancel: function () {
			this.PlantF4Frag.destroy();
			this.PlantF4Frag = "";
		},

		onMaterialValueHelp: function () {
			if (!this.MaterialF4Frag) {
				this.MaterialF4Frag = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.MaterialFrag", this);
				this.MaterialF4Temp = sap.ui.getCore().byId("materialTempId").clone();
			}
			this.getView().addDependent(this.MaterialF4Frag);
			sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
				path: "/MaterialHelpSet",
				template: this.MaterialF4Temp
			});
			this.MaterialF4Frag.open();
		},

		handleMaterialSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var sp = sValue ? { custom: { search: sValue } } : "";
			sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
				path: "/MaterialHelpSet",
				parameters: sp,
				template: this.MaterialF4Temp
			});
		},

		handleMaterialClose: function (oEvent) {
			var data = oEvent.getParameter("selectedItem").getBindingContext().getObject();
			sap.ui.getCore().getModel("filterModel").getData().Matnr = data.Matnr;
			sap.ui.getCore().getModel("filterModel").refresh("true");
			this.MaterialF4Frag.destroy();
			this.MaterialF4Frag = "";
		},

		handleMaterialCancel: function () {
			this.MaterialF4Frag.destroy();
			this.MaterialF4Frag = "";
		},

		onFilterSubmit: function () {
			var data = sap.ui.getCore().getModel("filterModel").getData();
			var vendor = data.Vendor_No || "";
			if (this.getView().getModel().getHeaders().LoginType === "E" && !vendor.trim()) {
				sap.m.MessageBox.error("Please fill all the required details");
				return;
			}
			var Matnr = data.Matnr || "";
			var Werks = data.Werks || "";
			this.byId("masterListId").bindAggregation("items", {
				path: "/S_HEADERSet",
				filters: [
					new sap.ui.model.Filter("Matnr", "EQ", Matnr),
					new sap.ui.model.Filter("Plant", "EQ", Werks),
					// new sap.ui.model.Filter("Vendor_No", "EQ", vendor),
					// new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")
				],
				template: this.listTemp
			});
			this.filterFragment.close();
			this.filterFragment.destroy();
			this.filterFragment = "";
			if (Matnr || Werks) {
				this.getView().byId("clearFilterId").setVisible(true);
			}
			this.routeToDetail();
		},

		onFilterCancel: function () {
			this.filterFragment.close();
			this.filterFragment.destroy();
			this.filterFragment = "";
		},

		onFilterClear: function () {
			this.byId("clearFilterId").setVisible(false);
			if (sap.ui.getCore().getModel("filterModel").getData().Vendor_No) {
				this.byId("masterListId").bindItems({
					path: "/S_HEADERSet",
					// filters: [
					// 	new sap.ui.model.Filter("Vendor_No", "EQ", sap.ui.getCore().getModel("filterModel").getData().Vendor_No),
					// 	new sap.ui.model.Filter("Bukrs", "EQ", sessionStorage.getItem("compCode") || "1000")
					// ],
					template: this.listTemp
				});
				sap.ui.getCore().getModel("filterModel").setData({ Vendor_No: sap.ui.getCore().getModel("filterModel").getData().Vendor_No });
			} else {
				this.byId("masterListId").bindItems({
					path: "/S_HEADERSet",
					template: this.listTemp
				});
				sap.ui.getCore().getModel("filterModel").setData({});
			}
			this.routeToDetail();
		}
	});
});