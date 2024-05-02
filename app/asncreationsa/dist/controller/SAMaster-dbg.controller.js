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
			var that = this;
			this.userType = this.getOwnerComponent().getModel().getHeaders().loginType;
			if (that.userType === "P") {
				this.getASNData();
			} else {
				sap.ui.core.BusyIndicator.show();
				this.suppData = [];
				return new Promise((resolve, reject) => {
					this.getOwnerComponent().getModel().callFunction("/GetSupplierList", {
						method: "GET",
						success: (oData) => {
							sap.ui.core.BusyIndicator.hide();
							this.suppData = oData.results;
							this.openDialog();
							resolve();
						},
						error: (oError) => {
							sap.ui.core.BusyIndicator.hide();
							// reject(new Error("Failed to fetch supplier data."));
							var value = JSON.parse(oError.response.body);
							MessageBox.error(value.error.message.value);
						}
					});
				});
			}
		},
		openDialog() {
			this.dialog = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.Dialog", this);

			this.dialog.setModel(new JSONModel([]), "SupplierModel");
			this.dialog.getModel("SupplierModel").setSizeLimit(this.suppData.length);
			this.dialog.getModel("SupplierModel").setData(this.suppData);

			this.dialog.open();
		},
		onApplyPress: function (evt) {
			let validate = [];
			const suppList = sap.ui.getCore().byId("suppList");
			if (suppList.getSelectedKey() !== "") {
				validate.push(true);
				suppList.setValueState("None");
				sessionStorage.setItem("AddressCodeASNSA", suppList.getSelectedKey());
			} else {
				validate.push(false);
				suppList.setValueState("Error");
			}
			if (validate.every(item => item === true)) {
				evt.getSource().getParent().destroy();
				this.getASNData();
			}

		},
		getASNData: function () {
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
			this.AddressCodeASNSA = sessionStorage.getItem("AddressCodeASNSA") || "AKI-03-01";
			this.LoggedUser = sessionStorage.getItem("LoggedUser") || "rajeshsehgal@impauto.com";
			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/GetASNHeaderList", {
				urlParameters: {
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
			var that = this;
			if (evt.getParameter("refreshButtonPressed") === true) {
				this.getView().byId("masterListId").getBinding("items").refresh(true);
			} else {
				sap.ui.core.BusyIndicator.show();
				var sValue = evt.getParameter("query");
				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/GetASNHeaderList", {
					urlParameters: {
						"search": sValue,
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
			}
		},
		onDialogEscapeHandler: function (oPromise) {
			oPromise.reject();
		},

		onFilter: function () {
			if (!this.filterFragment) {
				this.filterFragment = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.filterFragment", this);
				this.filterFragment.setModel(this.filterModel, "filterModel");

			}
			this.filterVisibleModel = new sap.ui.model.json.JSONModel({
				ASNNumber: true,
				StartDate: true,
				EndDate: true,
				Werks: true,
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

		onFilterSubmit: function () {
			var that = this;
			var data = this.filterModel.getData();

			this.AddressCodeASNSA = sessionStorage.getItem("AddressCodeASNSA");
			var ASNNumber = data.ASNNumber;
			var StartDate = data.StartDate;
			var EndDate = data.EndDate;
			this.fUnitCode = data.Werks;

			var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "ddMMMyyyy"
			});
			if (EndDate === "" && EndDate === null && EndDate === undefined) {
				EndDate = new Date();
			}
			if (StartDate === "" && StartDate === null && StartDate === undefined) {
				StartDate = new Date(EndDate.getTime() - 30 * 24 * 3600 * 1000);
			}
			this.ASNtodate = dateFormat1.format(EndDate);
			this.ASNfromdate = dateFormat1.format(StartDate);
			this.ASNtodate = this.ASNtodate.substring(0, 2) + " " + this.ASNtodate.substring(2, 5) + " " + this.ASNtodate.substring(5, 9);
			this.ASNfromdate = this.ASNfromdate.substring(0, 2) + " " + this.ASNfromdate.substring(2, 5) + " " + this.ASNfromdate.substring(5, 9);

			

				var oModel = this.getOwnerComponent().getModel();
				oModel.read("/GetASNHeaderList", {
					urlParameters: {
						AddressCode: this.AddressCodeASNSA,
						PoNumber: '',
						ASNNumber: ASNNumber || '',
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
						that.data = [...oData.results];
						if(that.fUnitCode) {
							const fData = that.data.filter(item => item.PlantCode === that.fUnitCode);
							that.DataModel.setData({ "results": fData });
						}
						that.routeToDetail();
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
					}
				});
			
			if (data.Werks) {
				this.PlantFilter = this.fUnitCode + "(" + this.desc + ")";
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

			this.getASNData();
		},
		// onFromDateChange: function (oEvent) {
		// 	var FromDate = this.getView().byId("startDateId").getDateValue();
		// 	var ToDate = this.getView().byId("endDateId").getDateValue();
		// 	this.getView().byId("endDateId").setMinDate(FromDate);
		// 	if (ToDate <= FromDate) {
		// 		this.getView().byId("endDateId").setDateValue(new Date(FromDate));
		// 	}
		// 	oEvent.getSource().$().find('INPUT').attr('disabled', true).css('color', '#000000');
		// },
	});
});