sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet",
], function (Controller, MessageBox,Spreadsheet) {
	"use strict";

	return Controller.extend("sap.fiori.asncreationsa.controller.SAConfirm", {
		// formatter: formatter,
		onInit: function () {

			this.fragModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.fragModel, "fragModel");

			this.oDataModel = sap.ui.getCore().getModel("oDataModel");
			this.oDataModel.setRefreshAfterChange(false);

			this.flagModel = sap.ui.getCore().getModel("flagModel");
			this.getView().setModel(this.oDataModel);

			// this.oTableColumnModel = this.getView().getModel("TableColumn");

			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);

			this.detailModel = new sap.ui.model.json.JSONModel();
			this.detailModel.setSizeLimit(100000000000);
			this.getView().setModel(this.detailModel, "detailModel");

			this.headerModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.headerModel, "headerModel");

			this.popOverModel = new sap.ui.model.json.JSONModel();
			this.detailAmountPopoverModel = new sap.ui.model.json.JSONModel();
			this.ConfirmFragModel = new sap.ui.model.json.JSONModel();

			this.getView().addStyleClass("sapUiSizeCompact");

		},
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.router.navTo("SAMaster");
			}
		},

		handleRouteMatched: function (event) {

			if (event.getParameter("name") === "SAConfirm") {
				// 	this.getView().byId("RB1-1").setSelected(true);
				// 	sap.ui.core.BusyIndicator.show(0);
				// 	this.odata = {};
				var that = this;
				//this.getView().byId("ShipDateId").setMinDate(new Date());
				// 	this.getView().byId("chkBoxSelectAll").setSelected(false);
				this.getView().byId("DeliveryTableId").removeSelections(true);
				this.Schedule_No = event.getParameter("arguments").Schedule_No;
				var request = "/S_HEADERSet(Schedule_No='" + this.Schedule_No + "')";
				this.oDataModel.read(request, null, null, false, function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.odata = oData;
					that.headerModel.setData(oData);
					that.headerModel.refresh(true);
				},
					function (oError) {
						sap.ui.core.BusyIndicator.hide();
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);

					}
				);

				sap.ui.core.BusyIndicator.show(0);
				this.oDataModel.read("/ConfirmDataSet?$filter=Schedule_No eq '" + this.Schedule_No + "'", null, null, false, function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.odata = oData;
					that.detailModel.setData(oData);
					that.detailModel.refresh(true);
				},
					function (oError) {
						sap.ui.core.BusyIndicator.hide();
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
						that.router.navTo("SADetail", {
							"Schedule_No": that.Schedule_No
						});
					}
				);
			}
		},

		dateFormat: function (oDate) {
			if (oDate !== "" && oDate !== null && oDate !== undefined) {

				var date = oDate.substring(4, 6) + "/" + oDate.substring(6, 8) + "/" + oDate.substring(0, 4);

				var DateInstance = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd MMM"
				});
				return dateFormat.format(DateInstance);
			}
			return "";
		},

		onCofirmAsn: function (oEvent) {

			var that = this;
			this.detailModel.refresh(true);
			this.data = this.headerModel.getData();
			this.tableData = this.detailModel.getData().results;

			var oTable = this.getView().byId("DeliveryTableId");

			var contexts = oTable.getSelectedContexts();

			if (contexts.length) { //Check whether table has any selected contexts
				var createData = {
					"Amount": this.data.Amount,
					"Buyer_Name": this.data.Buyer_Name,
					"Currency": this.data.Currency,
					"Item_Count": this.data.Item_Count,
					"Order_Type": this.data.Order_Type,
					"Order_Type_Desc": this.data.Order_Type_Desc,
					"Schedule_Date": this.data.Schedule_Date,
					"Schedule_No": this.data.Schedule_No,
					"Purchase_Group": this.data.Purchase_Group,
					"Purchase_Group_Desc": this.data.Purchase_Group_Desc,
					"Purchase_Org": this.data.Purchase_Org,
					"Purchase_Org_Desc": this.data.Purchase_Org_Desc,
					"Status": this.data.Status,
					"Upcoming_Del_Date": this.data.Upcoming_Del_Date,
					"Vendor_Name": this.data.Vendor_Name,
					"Confirmnav": []
				};
				var items = contexts.map(function (c) {
					return c.getObject();
				});

				if (items.length) {
					for (var i = 0; i < items.length; i++) {
						var temp = parseFloat(items[i].Quantity);
						if (temp === 0) {
							sap.m.MessageBox.error("Quantity can't be Zero");
							sap.ui.core.BusyIndicator.hide();
							return;
						}
						if (temp < 0 || items[i].Quantity.includes("-")) {
							sap.m.MessageBox.error("Quantity can't be in negative.");
							sap.ui.core.BusyIndicator.hide();
							return;
						}

						if (items[i].Quantity && items[i].Date) {

							var ReqDate = new Date(items[i].ReqDate.substring(0, 4) + "-" + items[i].ReqDate.substring(4, 6) + "-" +
								items[i].ReqDate.substring(6, 8));
							ReqDate = ReqDate.setHours(0, 0, 0, 0); // Required Date

							// var futureDate = new Date((new Date(ReqDate)).getTime() + 3 * 24 * 60 * 60 * 1000);
							// futureDate = futureDate.setHours(0, 0, 0, 0); // 3 Days ahead of Required Date

							var ConfirmDate = new Date(items[i].ShipDate.substring(0, 4) + "-" + items[i].ShipDate.substring(4, 6) + "-" + items[i].ShipDate
								.substring(
									6, 8));
							// var ConfirmDate = new Date(items[i].Date.substring(0, 4) + "-" + items[i].Date.substring(4, 6) + "-" + items[i].Date.substring(
							// 	6, 8));
							ConfirmDate = ConfirmDate.setHours(0, 0, 0, 0); // Confirmation Date

							var CurrentDate = new Date();
							CurrentDate = CurrentDate.setHours(0, 0, 0, 0); // Current Date

							// var Difference = (new Date(ConfirmDate) - new Date(ReqDate)) / 24 / 60 / 60 / 1000;

							if (ConfirmDate < CurrentDate) {
								MessageBox.error("Please enter current date or future date");
								sap.ui.core.BusyIndicator.hide();
								return;
							}
							if (ReqDate < CurrentDate) {
								// if (Difference > 3) {
								// 	MessageBox.error("Confirmation Date cannot be more than 3 Days advance.");
								// 	sap.ui.core.BusyIndicator.hide();
								// 	return;
								// } else {

								//===============================================================================================
								if (parseInt(items[i].Quantity) <= (parseInt(items[i].Po_Qty) - parseInt(items[i].Con_Qty))) {
									createData.Confirmnav.push(items[i]);
								} else {
									MessageBox.error("Quantity to be confirmed is greater than the balance quantity for " + items[i].Material_Desc);
									sap.ui.core.BusyIndicator.hide();
									return;
								}
								//===============================================================================================
								// }
							} else {
								//===============================================================================================
								if (parseInt(items[i].Quantity) <= (parseInt(items[i].Po_Qty) - parseInt(items[i].Con_Qty))) {
									createData.Confirmnav.push(items[i]);
								} else {
									MessageBox.error("Quantity to be confirmed is greater than the balance quantity for " + items[i].Material_Desc);
									sap.ui.core.BusyIndicator.hide();
									return;
								}
								//===============================================================================================
							}

						} else {
							MessageBox.error("Quantity and Confirmation date is required for selected items");
							sap.ui.core.BusyIndicator.hide();
							return;
						}
					}
				}
			}

			if (createData.Confirmnav.length <= 0) {
				MessageBox.error("No Items Selected");
			} else {
				MessageBox.confirm("Do You Want to Confirm ? ", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
					onClose: function (oAction) {
						if (oAction === "OK") {
							sap.ui.core.BusyIndicator.show(0);
							that.oDataModel.create("/S_HEADERSet", createData, null,
								function (oData) {
									MessageBox.confirm("Successfully Confirmed!", {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "SUCCESS",
										actions: [sap.m.MessageBox.Action.OK],
										onClose: function (action) {
											sap.ui.core.BusyIndicator.hide();
											that.oDataModel.read("/ConfirmDataSet?$filter=Schedule_No eq '" + this.Schedule_No + "'", null, null, false,
												function (oData) {
													sap.ui.core.BusyIndicator.hide();
													oTable.removeSelections();
													that.odata = oData;
													that.detailModel.setData(oData);
													that.detailModel.refresh(true);
												},
												function (oError) {
													sap.ui.core.BusyIndicator.hide();
													var value = JSON.parse(oError.response.body);
													MessageBox.error(value.error.message.value);
													that.router.navTo("SADetail", {
														"Schedule_No": that.Schedule_No
													});
												}
											);
										}
									});

								},
								function (oError) {
									sap.ui.core.BusyIndicator.hide();
									that.router.navTo("SADetail", {
										"Schedule_No": that.Schedule_No
									});
									// try {
									// 	var error = JSON.parse(oError.response.body);
									// 	sap.m.MessageBox.error(error.error.message.value, {
									// 		onClose: function (oAction1) {
									// 			// that.onNavBack();
									// 			that.router.navTo("SADetail", {
									// 				"Schedule_No": that.Schedule_No
									// 			});
									// 		}
									// 	});
									// } catch (err) {
									// 	var errorXML = jQuery.parseXML(oError.getParameter("responseText")).querySelector("message").textContent;
									// 	sap.m.MessageBox.error(errorXML, {
									// 		onClose: function (oAction2) {
									// 			// that.onNavBack();
									// 			that.router.navTo("SADetail", {
									// 				"Schedule_No": that.Schedule_No
									// 			});
									// 		}
									// 	});
									// }
								});
						}
					}
				});
			}
		},
		onFragClose: function (oEvent) {
			oEvent.getSource().getParent().close();
		},

		onQuanPress: function (e) {
			var that = this;

			if (!this.QuantFrag) {
				this.QuantFrag = sap.ui.xmlfragment("sap.fiori.asncreationsa.view.SAFragRequiredQuan", this);
				this.getView().addDependent(this.QuantFrag);
			}

			var sPath = e.getSource().getBindingContext("detailModel").getPath();
			var data = this.detailModel.getProperty(sPath);

			this.oDataModel.read("/S_LINEITEMSSet?$filter=Schedule_No eq '" + data.Schedule_No + "' and Schedule_Item eq '" + data.Schedule_Item +
				"' and Material_No eq '" + data.Material_No + "' and Uom eq '" + data.Uom + "'", null, null, false,
				function (oData, oResponse) {
					that.popOverModel.setData(oData);
					that.QuantFrag.setModel(that.popOverModel, "itemModel");
					that.popOverModel.refresh(true);
				});

			this.QuantFrag.openBy(e.getSource());
		},

		onQtyLiveChange: function (oEvent) {
			if (oEvent.getParameter("newValue").includes(".")) {
				MessageBox.error("Fractional Values are not allowed");
				oEvent.getSource().setValue(parseInt(oEvent.getParameter("newValue"), 10).toString());
				return;
			}
		},
		onTableFinished: function (oEvent) {
			var tableItems = this.getView().byId("DeliveryTableId").getItems();
			for (var i = 0; i < tableItems.length; i++) {
				var item = tableItems[i];
				// item.$().find('INPUT').attr('disabled', true).css('color', '#000000');
			}
		},
		onDateChanged: function (oEvent) {
			var Item = oEvent.getSource();
			Item.$().find('INPUT').attr('disabled', true).css('color', '#000000');
		},
		onDateFilter: function (event) {
			var FromDate = this.byId("FromDateId").getValue();
			var ToDate = this.byId("ToDateId").getValue();
			var oBindings = this.getView().byId("DeliveryTableId").getBinding("items");
			if (FromDate || ToDate) {
				var Filter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter({
							path: "ShipDate",
							operator: sap.ui.model.FilterOperator.LE,
							value1: ToDate
						}),
						new sap.ui.model.Filter({
							path: "ShipDate",
							operator: sap.ui.model.FilterOperator.GE,
							value1: FromDate
						})
					],
					and: true
				});
				oBindings.filter(Filter);
			} else {
				MessageBox.error("No Dates are Selected");
			}
		},
		onDateFilterClear: function (event) {
			this.byId("FromDateId").setValue("");
			this.byId("ToDateId").setValue("");
			this.getView().byId("DeliveryTableId").getBinding("items").filter([]);
		},
		onMaterialLiveChange: function (oEvent) {
			var search = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
			var afilters = [];
			if (search) {
				// var values = search.split(" ");
				// if (values.length) {
					// for (var i = 0; i < values.length; i++) {
					//	if (values[i].trim()) {
							afilters.push(new sap.ui.model.Filter("Material_No", sap.ui.model.FilterOperator.Contains, search));
							afilters.push(new sap.ui.model.Filter("Material_Desc", sap.ui.model.FilterOperator.Contains, search));
					//	}
					// }
				// }
			} else {
				afilters.push(new sap.ui.model.Filter("Material_No", sap.ui.model.FilterOperator.EQ, ""));
				afilters.push(new sap.ui.model.Filter("Material_Desc", sap.ui.model.FilterOperator.Contains, ""));
			}
			this.byId("DeliveryTableId").getBinding("items").filter(new sap.ui.model.Filter({
				filters: afilters
			}));
		},

		onRowSelect: function (e) {
			var data = this.detailModel.getData();
			// this.asnModel.refresh(true);
			var oTable = this.getView().byId("DeliveryTableId");
			var contexts = oTable.getSelectedContexts();

			for (var i = 0; i < contexts.length; i++) {
				var index = contexts[i].getPath().substring(contexts[i].getPath().lastIndexOf("/") + 1);
				var item = contexts[i].getProperty();
				for (var j = 0; j < oTable.getItems().length; j++) {
					// if (oTable.getItems()[index - 1]) {
					var previousItem = oTable.getItems()[j].getBindingContext("detailModel").getProperty();
					var previousIndex = oTable.getItems()[j].getBindingContext("detailModel").getPath()
						.substring(oTable.getItems()[j].getBindingContext("detailModel").getPath().lastIndexOf("/") + 1);
					if ((previousItem.Material_No === item.Material_No && previousItem.Schedule_Item === item.Schedule_Item) && parseInt(
						previousIndex) < parseInt(index) &&
						!oTable.getItems()[j].getSelected()) {
						var forwardItem = oTable.getItems()[j + 1].getBindingContext("detailModel").getProperty();
						if (forwardItem.Material_No === item.Material_No && forwardItem.Schedule_Item === item.Schedule_Item) {
							oTable.getItems()[j + 1].setSelected(false);
						}
					}
				}
				// }
			}

			// this.onSelectionChangeEnableDisableCheck(e);
			// else {
			// 	MessageBox.information("Please select the item");
			// 	e.getSource().setValue();
			// }

		},
		onExportPress: function () {

			var data = this.getView().getModel("detailModel").getData().results;
			this.filename = "Data.xlsx";


			if (data.length > 0) {
				let expCols = [], cell, prop, temp = "{0}";
				const row = this.byId("DeliveryTableId").getItems()[0];
				this.byId("DeliveryTableId").getColumns().forEach((col, index) => {
					if (col.getAggregation("header")) {
						// making export columns
						cell = row.getAggregation("cells")[index];
						switch (cell.getMetadata().getName()) {
							case "sap.m.ObjectIdentifier":
								prop = [cell.getBindingInfo("title").parts[0].path];
								temp = "{0}";
								break;
							case "sap.m.ObjectNumber":
								prop = cell.getBindingInfo("number").parts[0].path;

								break;
							case "sap.m.Input":
								prop = cell.getBindingInfo("value").parts[0].path;
								break;
							case "sap.m.DatePicker":
								prop = cell.getBindingInfo("value").parts[0].path;
								break;
							case "sap.m.Button":
								break;
							default:
								prop = cell.getBindingInfo("text").parts[0].path;
								break;
						}
						expCols.push({
							label: col.getAggregation("header").getText(),
							property: prop,
							template: temp
						});
					}
				});
				const oSheet = new Spreadsheet({
					workbook: { columns: expCols },
					dataSource: data,
					fileName: this.filename
				});
				oSheet.build().finally(() => oSheet.destroy());
			} else
				MessageToast.show("No data to export");
		},
	});
});