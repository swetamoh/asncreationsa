sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"

], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("sap.fiori.asncreationsa.controller.SAAsnEdit", {
		onInit: function () {

			// this.loginModel = sap.ui.getCore().getModel("loginModel");
			// this.loginData = this.loginModel.getData();

			this.selectedItems = [];

			this.oDataModel = sap.ui.getCore().getModel("oDataModel");
			this.getView().setModel(this.oDataModel);

			this.getView().addStyleClass("sapUiSizeCompact");

			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);

			this.asnModel = new sap.ui.model.json.JSONModel();
			this.asnModel.setSizeLimit(10000);
			this.getView().setModel(this.asnModel, "asnModel");

			this.getView().byId("AsnCreateTable").setSticky(["ColumnHeaders", "HeaderToolbar"]);
			this.uploadCollectionTemp = this.getView().byId("UploadCollItemId").clone();
			// this.asnCreateModel = new sap.ui.model.json.JSONModel();
			// this.getView().setModel(this.asnCreateModel, "asnCreateModel");
			this.dateConfirmationModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.dateConfirmationModel, "DateConfirmationModel");
			this.popOverModel = new sap.ui.model.json.JSONModel();
			this.DeleteArray = [];
			this.DeleteFlag = false;
		},
		handleRouteMatched: function (event) {

			if (event.getParameter("name") === "SAAsnEdit") {
				var that = this;
				this.getView().byId("AsnCreateTable").removeSelections(true);
				var datePicker = this.getView().byId("DP1");

				datePicker.addDelegate({
					onAfterRendering: function () {
						datePicker.$().find('INPUT').attr('disabled', true).css('color', '#000000');
					}
				}, datePicker);

				//=====================================================================

				// var oTable = this.getView().byId('AsnCreateTable');
				// oTable.addDelegate({
				// 	onAfterRendering: function () {
				// 		var header = this.$().find('thead');
				// 		var selectAllCb = header.find('.sapMCb');
				// 		selectAllCb.remove();

				// 		this.getItems().forEach(function (r) {
				// 			var Index = r.getBindingContext("asnModel").getPath().split("/")[3];
				// 			// var obj = r.getBindingContext("asnModel").getObject();
				// 			// var status = obj.Status;
				// 			var cb = r.$().find('.sapMCb');
				// 			var oCb = sap.ui.getCore().byId(cb.attr('id'));
				// 			if (Index == 0) {
				// 				oCb.setEnabled(true);
				// 			} else {
				// 				oCb.setEnabled(false);
				// 			}
				// 		});
				// 	}
				// }, oTable);

				//=====================================================================

				// code for date Restriction
				// this.getView().byId("DP1").setDateValue(new Date());
				// var fdate = new Date();
				// this.getView().byId("DP1").setMaxDate(fdate);
				var Today = new Date();
				var Tomorrow = new Date();
				var Yesterday = new Date();

				Yesterday.setDate(Today.getDate() - 4);
				Tomorrow.setDate(Today.getDate() + 1);
				// this.getView().byId("DP1").setDateValue(new Date());
				this.getView().byId("DP1").setMinDate(Yesterday);
				this.getView().byId("DP1").setMaxDate(Today);
				// this.Po_Num = event.getParameter("arguments").Po_No;
				this.Amount = event.getParameter("arguments").Amount;
				this.Amount.trim();
				this.Vendor_No = event.getParameter("arguments").Vendor_No;
				this.Asn_No = event.getParameter("arguments").Asn_No;
				this.FisYear = this.getOwnerComponent().getComponentData().startupParameters.FisYear[0];
				this.getView().byId("AsnObjectId").setTitle("ASN Number:" + this.Asn_No + "/" + this.FisYear + "");
				this.getView().byId("AsnCreateTable").removeSelections(true);
				this.Schedule_No = event.getParameter("arguments").Schedule_No;
				// ,App='ASN'
				this.oDataModel.read("/ASN_HEADERSet(Schedule_No='" + this.Schedule_No + "')?$expand=ASNItemnav",
					null, null, false,
					function (oData, oResponse) {
						var DraftQty = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("AsnItems");
						var POItems = oData.ASNItemnav.results;
						POItems.forEach(function (item) {
							DraftQty.forEach(function (qty) {
								if (item.Ebelp === qty.ItemNo.trim() && item.Etenr === qty.schd_line.trim()) {
									item.Draft_AsnQty = qty.Quantity;
									item.Draft_AsnQty1 = qty.Quantity; // need to do some calculations at update
								}
							});
						});
						let pkgMatQty;
						oData.ASNItemnav.results = POItems.filter(function (item) {
							pkgMatQty = parseFloat(item.Draft_AsnQty) / parseFloat(item.SOQ);
							item.PkgMatQty = isNaN(pkgMatQty) ? "0" : isFinite(pkgMatQty) === false ? "0" : (Math.ceil(pkgMatQty)).toString();
							item.NetprVen = item.Netpr.trim();
							return item.Menge !== "0.00" || item.Draft_AsnQty !== "0";
						});

						POItems.forEach(function (item, index) {
							if (item.Draft_AsnQty !== "0") {
								item.Selected = true;
								item.CheckFlag = "X";
								// that.byId("AsnCreateTable").getItems()[index].setSelected(true);
								// ModelData.ASNamt = parseFloat(ModelData.ASNamt) + (parseFloat(item.Menge) * ((parseFloat(item.Netpr)) + (parseFloat(item.Cgst)) +
								// 	(parseFloat(item.Igst)) + (parseFloat(item.Sgst))));
								// ModelData.ASNamt = parseFloat(ModelData.ASNamt).toFixed(2);
								// ModelData.InvoiceAmt = ModelData.ASNamt;
							}
						});
						that.asnModel.setData(oData);
						that.asnModel.getData().InvoiceAmt = that.Amount;
						that.asnModel.getData().InvoiceNum = that.getOwnerComponent().getComponentData().startupParameters.Invoice_Num[0];
						that.asnModel.getData().InvoiceDate = that.getOwnerComponent().getComponentData().startupParameters.Invoice_Date[0];
						if (jQuery.sap.storage(jQuery.sap.storage.Type.session).get("UnplannedCost")) {
							that.asnModel.getData().UnplannedCost = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("UnplannedCost").trim();
							var InvoiceVal = +that.asnModel.getData().InvoiceAmt + +that.asnModel.getData().UnplannedCost;
							that.asnModel.getData().InvoiceVal = InvoiceVal.toFixed(2);
							that.getView().byId("AsnObjectId").setNumber(that.asnModel.getData().InvoiceVal);
						}
						that.asnModel.refresh(true);
						// that.getView().byId("DP1").setDateValue(new Date());
						var oTable = that.getView().byId("AsnCreateTable");
						var oBindingInfo = oTable.getBindingInfo('items');
						delete oBindingInfo.filters;
						oTable.bindAggregation('items', oBindingInfo);
					},
					function (oError) {
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value, {
							onClose: function () {
								sap.fiori.asncreationsa.controller.formatter.onNavBack();
							}
						});
					});

				// Get CSRF token

				if (!this.header_xcsrf_token) {
					var model = this.getView().getModel();
					var oServiceUrl = model.sServiceUrl + "/";
					var that = this;

					sap.ui.core.BusyIndicator.show(0);
					model._request({
						requestUri: oServiceUrl,
						method: "GET",
						headers: {
							"X-Requested-With": "XMLHttpRequest",
							"Content-Type": "application/atom+xml",
							"DataServiceVersion": "2.0",
							"X-CSRF-Token": "Fetch"
						}
					}, function (data, response) {
						sap.ui.core.BusyIndicator.hide();
						that.header_xcsrf_token = response.headers["x-csrf-token"];
					});
					sap.ui.core.BusyIndicator.hide();
				}
				sap.ui.core.BusyIndicator.hide();

				this.getView().byId("UploadCollection").bindItems({
					path: "/AsnAttachementSet?$filter=AsnNum eq '" + this.Asn_No + "' and FisYear eq '" + this.FisYear + "'",
					template: that.uploadCollectionTemp
				});
			}
		},

		onUnplannedCostChange: function (oEvent) {
			if (oEvent.getParameter("newValue").includes("-")) {
				MessageBox.error("Unplanned cost less than 0 is not allowed!");
				var newVal = Math.abs(parseFloat(oEvent.getParameter("newValue")));
				oEvent.getSource().setValue(newVal);
			}
			if (oEvent.getParameter("newValue").includes(".")) {
				var splitValue = oEvent.getParameter("newValue").split(".");
				if (splitValue[1].length > 2) {
					MessageBox.error("Value upto 2 decimals is allowed.");
					oEvent.getSource().setValue(parseFloat(oEvent.getParameter("newValue")).toFixed(2));
				}
			}
		},

		onQuanChange: function (e) {
			var selected = e.getSource().getParent().getProperty("selected");
			var data = this.asnModel.getData();
			data.ASNamt = 0;
			var index = e.getSource().getParent().getBindingContext("asnModel").getPath().split("/")[3];
			var oTable = this.getView().byId("AsnCreateTable");
			var contexts = oTable.getSelectedContexts();
			var items = contexts.map(function (c) {
				return c.getObject();
			});

			data.ASNItemnav.results[index].Menge = e.getSource().getValue();

			for (var i = 0; i < items.length; i++) {

				if (!items[i].Netpr) {
					items[i].Netpr = 0;
				}
				if (!items[i].Cgst) {
					items[i].Cgst = 0;
				}
				if (!items[i].Igst) {
					items[i].Igst = 0;
				}
				if (!items[i].Sgst) {
					items[i].Sgst = 0;
				}

				// data.ASNamt = parseFloat(data.ASNamt) + (parseFloat(items[i].Menge) * ((parseFloat(items[i].Netpr)) + (parseFloat(items[i].Cgst)) +
				// 	(parseFloat(items[i].Igst)) + (parseFloat(items[i].Sgst))));
				// data.ASNamt = parseFloat(data.ASNamt).toFixed(2);
				var NetPr = (parseFloat(items[i].Menge) * (parseFloat(items[i].Netpr))).toFixed(2);
				var Cgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Cgst))).toFixed(2);
				var Igst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Igst))).toFixed(2);
				var Sgst = (parseFloat(items[i].Menge) * (parseFloat(items[i].Sgst))).toFixed(2);

				data.ASNamt = parseFloat(data.ASNamt) + parseFloat(NetPr) + parseFloat(Cgst) + parseFloat(Igst) + parseFloat(Sgst);
				data.ASNamt = parseFloat(data.ASNamt).toFixed(2);
			}
			// }
			data.ASNamt = parseFloat(data.ASNamt).toFixed(2);
			data.InvoiceAmt = data.ASNamt;
			this.asnModel.refresh(true);

			// this.onAsnQtyChange(e);
		},

		onAsnQtyChange: function (oEvent) {
			var Obj = oEvent.getSource().getParent().getBindingContext("asnModel").getObject();

			var CurrentLineItemIndex = oEvent.getSource().getParent().getBindingContext("asnModel").getPath().split("/")[3];

			var CurrentLineSelected = oEvent.getSource().getParent().getSelected();
			var CurrentLineAsnQtyDifference = parseFloat(Obj.Con_Qty) - (parseFloat(Obj.Asn_Created) + parseFloat(Obj.Menge));

			var oTable = this.getView().byId("AsnCreateTable");
			oTable.getItems().forEach(function (r) {

				var Index = r.getBindingContext("asnModel").getPath().split("/")[3];

				var cb = r.$().find('.sapMCb');
				var oCb = sap.ui.getCore().byId(cb.attr('id'));
				if (Index > CurrentLineItemIndex) {
					if (Index == parseInt(CurrentLineItemIndex, 10) + 1 && CurrentLineSelected && parseFloat(CurrentLineAsnQtyDifference) == 0) {
						oCb.setEnabled(true);
					} else {
						oCb.setSelected(false);
						oTable.setSelectedItem(r, false);
						oCb.setEnabled(false);
					}
				}
			});
		},
		onSelectionChangeEnableDisableCheck: function (oEvent) {
			var Obj = oEvent.getParameter("listItem").getBindingContext("asnModel").getObject();

			var CurrentLineItemIndex = oEvent.getParameter("listItem").getBindingContext("asnModel").getPath().split("/")[3];

			var CurrentLineSelected = oEvent.getParameter("listItem").getSelected();
			var CurrentLineAsnQtyDifference = parseFloat(Obj.Con_Qty) - (parseFloat(Obj.Asn_Created) + parseFloat(Obj.Menge));

			var oTable = this.getView().byId("AsnCreateTable");
			oTable.getItems().forEach(function (r) {

				var Index = r.getBindingContext("asnModel").getPath().split("/")[3];

				var cb = r.$().find('.sapMCb');
				var oCb = sap.ui.getCore().byId(cb.attr('id'));
				if (Index > CurrentLineItemIndex) {
					if (Index == parseInt(CurrentLineItemIndex, 10) + 1 && CurrentLineSelected && parseFloat(CurrentLineAsnQtyDifference) == 0) {
						oCb.setEnabled(true);
					} else {
						oCb.setSelected(false);
						oTable.setSelectedItem(r, false);
						oCb.setEnabled(false);
					}
				}
			});
		},

		onRowSelect: function (e) {
			var ListItems = this.getView().byId("AsnCreateTable").getItems();
			for (var i = 0; i < ListItems.length; i++) {
				var BindingContext = ListItems[i].getBindingContext("asnModel").getObject();
				if (BindingContext.CheckFlag == "X") {
					ListItems[i].setSelected(true);
				}
			}
			// if (e.getParameter("listItem").getBindingContext("asnModel").getProperty("CheckFlag") === "X") {
			// 	e.getParameter("listItem").setSelected(true);
			// }

			this.draftInvoiceAmt();
		},

		onNavBack: function () {
			// this.byId("FromDateId").setValue();
			// this.byId("ToDateId").setValue();
			// history.go(-2);
			// jQuery.sap.require("sap.ui.core.routing.History");
			// var oHistory = sap.ui.core.routing.History.getInstance(),
			// 	sPreviousHash = oHistory.getPreviousHash();

			// if (sPreviousHash !== undefined) {
			// 	// The history contains a previous entry    
			// 	history.go(-1);
			// } else {
			// 	// Otherwise we go backwards with a forward history  
			// 	var bReplace = true;
			// 	this.router.navTo("SAMaster", {}, bReplace);
			// }

			var component = this.getOwnerComponent().getComponentData();
			if (component !== undefined && component.startupParameters.ASN_NO) {
				//navigate to asn app
				var navigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				navigator.toExternal({
					target: {
						semanticObject: "asn",
						action: "manage"
					},
					params: {
						Asn_Num: component.startupParameters.ASN_NO[0]
					}
				});
			} else {
				this.router.navTo("SAMaster");
			}
		},

		onAsnUpdate: function () {
			var that = this;
			this.asnModel.refresh(true);
			this.data = this.asnModel.getData();
			var createData = {
				"Update": true,
				"Delete": this.DeleteFlag,
				"AsnNum": this.Asn_No,
				"Buyer_Name": this.data.Buyer_Name,
				"Currency": this.data.Currency,
				"InvoiceAmt": this.data.InvoiceAmt.toString(),
				"InvoiceVal": this.data.InvoiceVal.toString(),
				"UnplannedCost": this.data.UnplannedCost.toString(),
				// "ASNamt": this.data.ASNamt,
				"InvoiceDate": this.data.InvoiceDate,
				"InvoiceNum": this.data.InvoiceNum,
				"Purchase_Group_Desc": this.data.Purchase_Group_Desc,
				"ShipTime": this.data.ShipTime,
				"Total_Amount": this.data.Total_Amount,
				"Schedule_No": this.data.Schedule_No,
				"Werks": this.data.Werks,
				"Fis_Year": this.FisYear,
				"ASNItemnav": []
			};
			if (this.data.InvoiceNum) {
				createData.DraftAsn = false;
				if (this.getView().byId("UploadCollection").getItems().length <= 0) {
					MessageBox.error("Atleast One attachment is required.");
					return;
				}
			} else {
				createData.DraftAsn = true;
			}

			this.data.Schedule_No = this.Schedule_No;
			var oTable = this.getView().byId("AsnCreateTable");
			var aItems = "";
			var contexts = oTable.getSelectedContexts();
			if (contexts) {
				aItems = contexts.map(function (c) {
					return c.getObject();
				});
			}
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].Draft_AsnQty !== "0") {
					if (!aItems[i].Draft_AsnQty1) {
						aItems[i].Draft_AsnQty1 = "0.00";
					}
					var AsnCreated = +aItems[i].Asn_Created - +aItems[i].Draft_AsnQty1;
					var comparedQty = +aItems[i].Draft_AsnQty + AsnCreated;
					if (parseFloat(aItems[i].Con_Qty) < comparedQty) {
						// if (parseFloat(aItems[i].Menge) < parseFloat(aItems[i].Draft_AsnQty)) {
						sap.m.MessageBox.error("Draft ASN Quantity cannot be greater then ASN to be Created.");
						sap.ui.core.BusyIndicator.hide();
						return;
					}
				} else {
					MessageBox.error("Draft ASN Quantity is required for selected items");
					sap.ui.core.BusyIndicator.hide();
					return;
				}
				// delete aItems[i].Selected;
			}

			createData.ASNItemnav = aItems;
			// !createData.InvoiceNum || !createData.InvoiceDate ||
			if (!createData.InvoiceAmt) {
				MessageBox.error("Please fill all the required Information");
			} else if (createData.ASNItemnav.length <= 0) {
				MessageBox.error("No Line Item Selected");
			} else {
				var that = this;
				MessageBox.confirm("Do You Want to Update ASN ? ", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
					icon: sap.m.MessageBox.Icon.QUESTION,
					onClose: function (oAction) {
						if (oAction === "OK") {
							for (var j = 0; j < createData.ASNItemnav.length; j++) {
								delete createData.ASNItemnav[j].Selected;
								delete createData.ASNItemnav[j].CheckFlag;
								delete createData.ASNItemnav[j].Draft_AsnQty1;
							}
							that.oDataModel.create("/ASN_HEADERSet", createData, null, function (oData, response) {
								that.asn = oData.AsnNum;
								that.year = oData.Fis_Year;
								that.onStartUpload();
								sap.m.MessageBox.success("ASN No. " + oData.AsnNum + "/" + oData.Fis_Year + " updated Succesfully  ", {
									actions: [sap.m.MessageBox.Action.OK],
									icon: sap.m.MessageBox.Icon.SUCCESS,
									onClose: function (oAction) {
										if (oAction == "OK") {
											that.onNavBack();
											// history.go(-2);
											// that.router.navTo("SAMaster");
										}
									}
								});
							}, function (oError) {
								try {
									var error = JSON.parse(oError.response.body);
									MessageBox.error(error.error.message.value);
								} catch (err) {
									var errorXML = jQuery.parseXML(oError.getParameter("responseText")).querySelector("message").textContent;
									MessageBox.error(errorXML);
								}

							});
						}
					}
				});
			}
		},
		handleLinkPress: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.fiori.asncreationsa.view.PricePopoverFragment", this);
				this.getView().addDependent(this._oPopover);
			}

			var sPath = oEvent.getSource().getBindingContext("asnModel").sPath;
			var data = this.asnModel.getProperty(sPath);
			this.popOverModel.setData(data);
			this._oPopover.setModel(this.popOverModel);

			this._oPopover.openBy(oEvent.getSource());

		},

		onAsnCancel: function () {
			this.router.navTo("PoSplit");
		},

		onQuanPress: function (e) {
			var that = this;

			if (!this.QuantFrag) {
				this.QuantFrag = sap.ui.xmlfragment("sap.fiori.asncreationsa.view.SAFragRequiredQuan", this);
				this.getView().addDependent(this.QuantFrag);
			}

			var sPath = e.getSource().getBindingContext("asnModel").getPath();
			var data = this.asnModel.getProperty(sPath);

			this.oDataModel.read("/S_LINEITEMSSet?$filter=Schedule_No eq '" + data.Ebeln + "' and Schedule_Item eq '" + data.Ebelp +
				"' and Material_No eq '" + data.Matnr + "' and Uom eq '" + data.Uom + "'", null, null, false,
				function (oData, oResponse) {
					that.popOverModel.setData(oData);
					that.QuantFrag.setModel(that.popOverModel, "itemModel");
					that.popOverModel.refresh(true);
				});

			this.QuantFrag.openBy(e.getSource());
		},

		// onFilter: function () {
		// 	var oTable = this.getView().byId("AsnCreateTable");
		// 	var oBindingInfo = oTable.getBinding('items');
		// 	var Matnr = this.getView().byId("MaterialId").getValue();
		// 	var Maktx = this.getView().byId("MaterialId").getValue();
		// 	var Eindt = this.getView().byId("DelDateId").getValue();
		// 	if (!Eindt) {
		// 		Eindt = "";
		// 	}
		// 	if (!Matnr) {
		// 		Matnr = "";
		// 	}
		// 	//===============================================
		// 	if (Eindt && Matnr) {
		// 		var afilter1 =
		// 			new sap.ui.model.Filter({
		// 				filters: [
		// 					new sap.ui.model.Filter({
		// 						path: 'Maktx',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Maktx
		// 					}),
		// 					new sap.ui.model.Filter({
		// 						path: 'Matnr',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Matnr
		// 					})
		// 				],
		// 				and: false
		// 			});

		// 		var aFilter2 = new sap.ui.model.Filter({
		// 			path: 'Eindt',
		// 			operator: sap.ui.model.FilterOperator.EQ,
		// 			value1: Eindt
		// 		});

		// 		var afilters = [afilter1, aFilter2];
		// 	} else if (Matnr) {
		// 		afilters = [
		// 			new sap.ui.model.Filter({
		// 				filters: [
		// 					new sap.ui.model.Filter({
		// 						path: 'Matnr',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Matnr
		// 					}),
		// 					new sap.ui.model.Filter({
		// 						path: 'Maktx',
		// 						operator: sap.ui.model.FilterOperator.Contains,
		// 						value1: Maktx
		// 					})
		// 				],
		// 				and: false
		// 			})
		// 		];
		// 	} else if (Eindt) {
		// 		afilters = [
		// 			new sap.ui.model.Filter("Eindt", sap.ui.model.FilterOperator.EQ, Eindt)
		// 		];
		// 	} else {
		// 		delete oBindingInfo.filters;
		// 	}
		// 	oBindingInfo.filter(afilters);
		// },

		// onFilterClear: function () {
		// 	this.getView().byId("DelDateId").setValue("");
		// 	this.getView().byId("MaterialId").setValue("");
		// 	var oTable = this.getView().byId("AsnCreateTable");
		// 	var oBindingInfo = oTable.getBinding('items');
		// 	oBindingInfo.filter([]);
		// },

		onMaterialHelpReq: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			var that = this;
			if (!this.matFrag) {
				this.matFrag = sap.ui.xmlfragment("sap.fiori.asncreationsa.view.materialFrag", this);
				this.matTemp = sap.ui.getCore().byId("materialTempId").clone();
			}

			sap.ui.getCore().byId("materialF4Id").bindAggregation("items", {
				path: "oDataModel>/MaterialHelpSet?$filter=Schedule_No eq '" + that.Schedule_No + "'",
				template: that.matTemp
			});
			this.matFrag.open();
		},
		materialValueHelpClose: function (oEvent) {
			var oTable = this.getView().byId("AsnCreateTable");
			var oBindingInfo = oTable.getBindingInfo('items');
			var Val = oEvent.getParameter("selectedItem").getBindingContext("oDataModel").getObject().Matnr;
			this.getView().byId("MaterialId").setValue(Val);
			var Matnr = this.getView().byId("MaterialId").getValue();
			var Eindt = this.getView().byId("DelDateId").getValue();
			if (!Eindt) {
				Eindt = "";
			}
			if (!Matnr) {
				Matnr = "";
			}
			//===============================================
			var both = false;
			if (Eindt && Matnr) {
				both = true;
			}

			oBindingInfo.filters = [
				new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter({
							path: 'Matnr',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: Matnr
						}),
						new sap.ui.model.Filter({
							path: 'Eindt',
							operator: sap.ui.model.FilterOperator.EQ,
							value1: Eindt
						})
					],
					and: both
				})
			];

			oTable.bindAggregation('items', oBindingInfo);
		},

		//	********************************************Upload File start Code ***********************************
		onChange: function (oEvent) {
			var oUploadCollection = oEvent.getSource();

			// var model = this.getView().getModel();
			// var oServiceUrl = model.sServiceUrl;
			// oUploadCollection.setUploadUrl(oServiceUrl + "/LotAttachmentSet");

			// Header Token

			if (this.header_xcsrf_token) {
				var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
					name: "x-csrf-token",
					value: this.header_xcsrf_token
				});
				oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			}

		},

		onStartUpload: function (oEvent) {
			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.upload();
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			// var that = this;
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: this.asn + "/" + this.year + "/" + oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},
		onDeliveryCost: function (event) {
			// var invoiceAmount = this.getView().byId("invoiceAmtId").getValue();
			// var unplannedAmount = this.getView().byId("unplannedAmtId").getValue();

			// unplannedAmount = Math.abs(parseFloat(unplannedAmount));
			// unplannedAmount = unplannedAmount ? unplannedAmount : 0;

			// var InvoiceVal = +invoiceAmount + +unplannedAmount;
			// this.getView().byId("invoiceValueId").setValue(InvoiceVal.toFixed(2));
			// this.getView().byId("AsnObjectId").setNumber(InvoiceVal.toFixed(2));
		},
		onEditPress: function (event) {
			this.byId("invoiceValueId").setEditable(true);
		},
		onUpdateFinished: function (event) {
			var that = this;
			// var ModelData = this.asnModel.getData();
			var data = this.asnModel.getData().ASNItemnav.results;
			// data.forEach(function (item, index) {
			// 	if (item.Draft_AsnQty !== "0") {
			// 		item.Selected = true;
			// 		item.CheckFlag = "X";
			// 		// that.byId("AsnCreateTable").getItems()[index].setSelected(true);
			// 		// ModelData.ASNamt = parseFloat(ModelData.ASNamt) + (parseFloat(item.Menge) * ((parseFloat(item.Netpr)) + (parseFloat(item.Cgst)) +
			// 		// 	(parseFloat(item.Igst)) + (parseFloat(item.Sgst))));
			// 		// ModelData.ASNamt = parseFloat(ModelData.ASNamt).toFixed(2);
			// 		// ModelData.InvoiceAmt = ModelData.ASNamt;
			// 	}
			// });
			that.asnModel.refresh();
		},
		onDelete: function (event) {
			this.DeleteFlag = true;
			this.path = event.getSource().getBindingContext("asnModel").getPath().slice(-1);
			this.DeleteArray.push(this.asnModel.getData().ASNItemnav.results[this.path]);
			this.asnModel.getData().ASNItemnav.results.splice(this.path, 1);
			this.asnModel.refresh();
			this.asnModel.getData().InvoiceVal = '';
			this.draftInvoiceAmt();
		},
		draftInvoiceAmt: function (event) {
			const val = event.getParameter("newValue"),
				obj = event.getSource().getParent().getBindingContext("asnModel").getObject();

			if (event) {
				var Meins = obj.Meins;
				if (Meins == "EA") {
					if (val.includes(".")) {
						MessageBox.error("Fractional Values are not allowed");
						event.getSource().setValue(parseInt(val, 10).toString());
						return;
					}
				}
			}
			var data = this.asnModel.getData();
			data.InvoiceAmt = 0;
			var oTable = this.getView().byId("AsnCreateTable");
			var contexts = oTable.getSelectedContexts();

			if (contexts.length) {
				var items = contexts.map(function (c) {
					return c.getObject();
				});

				for (var i = 0; i < items.length; i++) {

					var temp = parseFloat(items[i].Draft_AsnQty);
					if (temp < 0 || items[i].Draft_AsnQty.includes("-")) {
						sap.m.MessageBox.error("Quantity can't be in negative.");
						sap.ui.core.BusyIndicator.hide();
						return;
					}
					if (!items[i].Draft_AsnQty) {
						sap.m.MessageBox.error("Please enter a valid Quantity for selected items");
						data.InvoiceAmt = 0;
						break;
					}
					// data.InvoiceAmt = parseFloat(data.InvoiceAmt) + (parseFloat(items[i].Draft_AsnQty) * (parseFloat(items[i].Netpr) + parseFloat(
					// 	items[i]
					// 	.Tax)));

					var NetPr = (parseFloat(items[i].Draft_AsnQty) * (parseFloat(items[i].Netpr))).toFixed(2);
					var Cgst = (parseFloat(items[i].Draft_AsnQty) * (parseFloat(items[i].Cgst))).toFixed(2);
					var Igst = (parseFloat(items[i].Draft_AsnQty) * (parseFloat(items[i].Igst))).toFixed(2);
					var Sgst = (parseFloat(items[i].Draft_AsnQty) * (parseFloat(items[i].Sgst))).toFixed(2);

					data.InvoiceAmt = parseFloat(data.InvoiceAmt) + parseFloat(NetPr) + parseFloat(Cgst) + parseFloat(Igst) + parseFloat(Sgst);

					data.InvoiceAmt = parseFloat(data.InvoiceAmt).toFixed(2);

					data.InvoiceAmt = Math.round(data.InvoiceAmt);

					var InvoiceVal = +this.asnModel.getData().InvoiceAmt + +this.asnModel.getData().UnplannedCost;

					InvoiceVal = Math.round(data.InvoiceAmt);

					this.asnModel.getData().InvoiceVal = InvoiceVal.toFixed(2);
					this.getView().byId("AsnObjectId").setNumber(this.asnModel.getData().InvoiceVal);
				}
			}

			const pkgMatQty = parseFloat(val) / parseFloat(obj.SOQ);
			obj.PkgMatQty = isNaN(pkgMatQty) ? "0" : isFinite(pkgMatQty) === false ? "0" : (Math.ceil(pkgMatQty)).toString();

			this.asnModel.refresh();
		},
		onUndo: function (evt) {
			var that = this;
			this.DeleteFlag = false;
			if (this.DeleteArray) {
				this.DeleteArray.forEach(function (item, index) {
					that.asnModel.getData().ASNItemnav.results.unshift(item);
				});
				that.asnModel.refresh();
				that.DeleteArray = [];
				that.draftInvoiceAmt();
			}

		},
		onLinkPress: function (oEvent) {
			var that = this;
			var LineItemData = oEvent.getSource().getParent().getBindingContext("asnModel").getObject();
			if (!this._oPopoverFragment) {
				this._oPopoverFragment = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.DatePopoverFragment", this);
				this._oPopoverFragment.setModel(this.dateConfirmationModel);
				this.getView().addDependent(this._oPopoverFragment);
			}
			this.oDataModel.read("/ConfirmationDateSet?$filter=Ebeln eq '" + LineItemData.Schedule_No + "'and Ebelp  eq '" + LineItemData.Ebelp +
				"' and Etens eq '" + LineItemData.Etenr + "'",
				null,
				null,
				false,
				function (oData, oResponse) {
					that.dateConfirmationModel.setData(oData);
					that.dateConfirmationModel.refresh(true);

				},
				function (oError) {
					var value = JSON.parse(oError.response.body);
					MessageBox.error(value.error.message.value);
				});
			this._oPopoverFragment.openBy(oEvent.getSource());
			// this._oPopover.openBy(oEvent.getSource());

		},
		onDeletePress: function (oEvent) {
			debugger;
			var that = this;
			var Data = oEvent.getSource().getBindingContext().getObject();

			MessageBox.confirm("Are you sure you want to delete this attachment?", {
				onClose: function (oAction) {
					if (oAction == "OK") {
						that.oDataModel.remove("/AsnAttachementSet(AsnNum='" + Data.AsnNum + "',FisYear='" + Data.FisYear + "',Sernr='" +
							Data.Sernr + "')", null,
							function (oData) {
								MessageBox.success("File Deleted successfully.");
								that.getView().byId("UploadCollection").bindItems({
									path: "/AsnAttachementSet?$filter=AsnNum eq '" + that.Asn_No + "' and FisYear eq '" + that.FisYear + "'",
									template: that.uploadCollectionTemp
								});
							},
							function (oError) {
								try {
									var error = JSON.parse(oError.getParameter("responseText"));
									MessageBox.error(error.error.message.value);
								} catch (err) {
									var errorXML = jQuery.parseXML(oError.getParameter("responseText")).querySelector("message").textContent;
									MessageBox.error(errorXML);
								}
							});
					}
				}
			});
		},
		onTypeMissmatch: function (oEvent) {
			MessageBox.error("Only PDF files are allowed.");
		}

	});

});