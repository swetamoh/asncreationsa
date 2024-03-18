sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, MessageBox, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.fiori.asncreationsa.controller.SADetail", {

		onInit: function () {

			// this.loginModel = sap.ui.getCore().getModel("loginModel");
			// this.loginData = this.loginModel.getData();

			this.oDataModel = sap.ui.getCore().getModel("oDataModel");
			// this.oDataModel = this.getView().getModel();

			this.getView().setModel(this.oDataModel);

			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRouteMatched(this.handleRouteMatched, this);

			this.detailHeaderModel = new sap.ui.model.json.JSONModel();
			this.detailHeaderModel.setSizeLimit(1000);
			this.getView().setModel(this.detailHeaderModel, "detailHeaderModel");
			this.detailModel = new sap.ui.model.json.JSONModel();
			this.detailModel.setSizeLimit(1000);
			this.getView().setModel(this.detailModel, "detailModel");
			this.materialDescModel = new sap.ui.model.json.JSONModel();
			this.materialDescModel.setSizeLimit(1000);
			this.getView().setModel(this.materialDescModel, "materialDescModel");

			this.ConfirmFragModel = new sap.ui.model.json.JSONModel();

			this.getView().addStyleClass("sapUiSizeCompact");

			this.getView().byId("ObjectId").onAfterRendering = function () {
				sap.m.ObjectHeader.prototype.onAfterRendering.apply(this, arguments);
				this.$().find('.sapMOHTitleDiv').find('.sapMText').css('color', "#af2323");
			};

		},

		handleRouteMatched: function (event) {

			if (event.getParameter("name") === "SADetail") {

				this.odata = {};
				var that = this;
				var oModel = this.getOwnerComponent().getModel();
				// this.oDataModel.setHeaders({
				// 	"loginId": that.loginData.loginName,
				// 	"LoginType": that.loginData.userType
				// });
				var unitCode = sessionStorage.getItem("unitCode") || 'P01';
				this.AddressCodeASNSA = sessionStorage.getItem("AddressCodeASNSA") || 'JSE-01-01';
				var Schedule_No = event.getParameter("arguments").Schedule_No;
				this.Schedule_No = Schedule_No.replace(/-/g, '/');
				// this.Vendor_No = event.getParameter("arguments").Vendor_No;

				// var request = "/PO_HEADERSet(Po_No='" + this.Po_Num + "',Vendor_No='" + this.Vendor_No + "')?$expand=headertoitemNav";

				var request = "/SchedulingAgreements";
				oModel.read(request, {
					urlParameters: {
						"$expand": "DocumentRows",
                        AddressCode: this.AddressCodeASNSA,
                        UnitCode: unitCode
                    },
					success: function (oData) {
						var filteredPurchaseOrder = oData.results.find(po => po.ScheduleNum === that.Schedule_No);
						if (filteredPurchaseOrder) {
							that.detailHeaderModel.setData(filteredPurchaseOrder);
							that.detailHeaderModel.refresh(true);
						
							that.detailModel.setData(filteredPurchaseOrder.DocumentRows.results);
							that.detailModel.refresh(true);
							var detailModelData = that.getView().getModel("detailModel").getData();
							for(var i = 0; i < detailModelData.length; i++){
								if(detailModelData[i].DeliveredQty === "0"){
									detailModelData[i].ConfirmStatus = "Open";
								}else if(detailModelData[i].DeliveredQty === detailModelData[i].PoQty){
									detailModelData[i].ConfirmStatus = "Closed";
								}else if((detailModelData[i].DeliveredQty > "0") && (detailModelData[i].DeliveredQty < detailModelData[i].PoQty)){
									detailModelData[i].ConfirmStatus = "Partially";
								}
							}
							that.detailModel.refresh(true);
						} else {
							//MessageBox.error("Schedule Number  not found");
						}
					},
					error: function (oError) {
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
					}
				});
				// var data = this.detailModel.getData().Sitemnav;
				// this.checkCount = 0;
				// this.enabledCount = 0;
				// this.getView().byId("chkBoxSelectAll").setSelected(false);
				// this.getView().byId("chkBoxSelectAll").setEnabled(true);

				// for (var i = 0; i < data.length; i++) {
				// 	if (data[i].Confirm_Status == "Not Confirmed") {
				// 		this.enabledCount++;
				// 	}
				// }
				// if (this.enabledCount == 0) {
				// 	this.getView().byId("chkBoxSelectAll").setEnabled(false);
				// }

				// this.getView().bindElement({
				// 	path: request,
				// 	events: {
				// 		dataReceived: function(oError) {}
				// 	}
				// });

			}
		},
		onCreateAsn: function () {
			var that = this;
			var Schedule_No = that.Schedule_No.replace(/\//g, '-');
			that.router.navTo("SAAsnCreate", {
				"Schedule_No": Schedule_No
			});
			// ,App='SA'
			// this.oDataModel.read("/ASN_HEADERSet(Schedule_No='" + this.Schedule_No + "')?$expand=ASNItemnav",
			// 	null, null, false,
			// 	function (oData, oResponse) {
			// 		that.router.navTo("SAAsnCreate", {
			// 			"Schedule_No": that.Schedule_No
			// 		});
			// 	},
			// 	function (oError) {
			// 		var value = JSON.parse(oError.response.body);
			// 		MessageBox.error(value.error.message.value);
			// 	});

		},
		onItempress: function (oEvent) {
			var Data = oEvent.getParameter("listItem").getBindingContext("detailModel").getObject();
			var ScheduleNo = Data.SchNum_ScheduleNum;
			var Schedule_No = ScheduleNo.replace(/\//g, '-');
			this.router.navTo("ItemDisplay", {
				"Schedule_No": Schedule_No,
				"Material_No": Data.ItemCode,
				"Line_No": Data.LineNum
			});
		},
		onChkBoxSelect: function (oEvent) {

			if (!oEvent.getParameter("selected")) {
				this.checkCount--;
			} else {
				this.checkCount++;
			}

			this.getView().byId("chkBoxSelectAll").setSelected(false);

			if (this.checkCount == this.enabledCount) {
				this.getView().byId("chkBoxSelectAll").setSelected(true);
			}

		},
		selectAllCheck: function (oEvent) {
			var that = this;
			that.detailModel.refresh(true);
			var isAllSelected = oEvent.getParameter("selected");
			var data = that.detailModel.getData();
			var tableData = data.Sitemnav;
			this.checkCount = 0;
			for (var i = 0; i < tableData.length; i++) {

				if (isAllSelected) {

					this.isSelected = tableData[i].Confirm_Status;

					if (this.isSelected == "Not Confirmed") {
						tableData[i].Item_indicator = true;
						this.checkCount++;
					}
				} else {
					tableData[i].Item_indicator = false;
				}
			}

			data.Sitemnav.results = tableData;
			this.detailModel.setData(data);
			this.detailModel.refresh(true);

		},

		onCofirmAsn: function (oEvent) {
			var data = this.detailModel.getData();
			this.router.navTo("SAConfirm", {
				Schedule_No: data.Schedule_No
			});
			// 	var that = this;
			// 	this.detailModel.refresh(true);
			// 	this.data = this.detailModel.getData();
			// 	this.tableData = this.data.Sitemnav;
			// 	var createData = {
			// "Amount": this.data.Amount,
			// "Buyer_Name": this.data.Buyer_Name,
			// "Currency": this.data.Currency,
			// "Item_Count": this.data.Item_Count,
			// "Order_Type": this.data.Order_Type,
			// "Order_Type_Desc": this.data.Order_Type_Desc,
			// "Schedule_Date": this.data.Schedule_Date,
			// "Schedule_No": this.data.Schedule_No,
			// "Purchase_Group": this.data.Purchase_Group,
			// "Purchase_Group_Desc": this.data.Purchase_Group_Desc,
			// "Purchase_Org": this.data.Purchase_Org,
			// "Purchase_Org_Desc": this.data.Purchase_Org_Desc,
			// "Status": this.data.Status,
			// "Upcoming_Del_Date": this.data.Upcoming_Del_Date,
			// "Vendor_Name": this.data.Vendor_Name,
			// 		"Sitemnav": []
			// 	};
			// 	for (var i = 0; i < that.tableData.length; i++) {
			// 		if (that.tableData[i].Item_indicator == "true" || that.tableData[i].Item_indicator == true) {
			// 			delete that.tableData[i].__metadata;
			// 			that.tableData[i].Item_indicator = "true";
			// 			createData.Sitemnav.push(that.tableData[i]);
			// 		}
			// 	}
			// 	if (createData.Sitemnav.length <= 0) {
			// 		MessageBox.error("No Line Item Selected");
			// 	} else {
			// 		MessageBox.confirm("Do You Want to Confirm ? ", {
			// 			actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CLOSE],
			// 			onClose: function(oAction) {
			// 				if (oAction === "OK") {
			// 					that.oDataModel.create("/S_HEADERSet", createData, null,
			// 						function(oData) {
			// 							MessageBox.success("Successfully Confirmed!");
			// 							that.router.navTo("SAMaster");
			// 						},
			// 						function(oError) {
			// 							try {
			// 								var error = jQuery.parseJSON(oError.response.body);
			// 								if (error.error.innererror.errordetails.length > 0) {
			// 									if (!that.FragConfirmResponse) {
			// 										that.FragConfirmResponse = sap.ui.xmlfragment("sap.fiori.asncreationsa.view.SAConfirmResponse", this);
			// 										// that.getView().addDependent(that.FragConfirmResponse);
			// 										that.FragConfirmResponse.setModel(that.ConfirmFragModel);
			// 									}
			// 									var errorLength = error.error.innererror.errordetails.length;
			// 									error.error.innererror.errordetails.splice(errorLength - 1, 1);
			// 									that.ConfirmFragModel.setData(error.error.innererror);
			// 									that.ConfirmFragModel.refresh(true);
			// 									sap.ui.getCore().byId("fragCloseId").attachPress(that.onFragClose);
			// 									that.FragConfirmResponse.open();
			// 								}
			// 								// MessageBox.error(error.error.message.value);
			// 							} catch (err) {
			// 								var errorXML = jQuery.parseXML(oError.getParameter("responseText")).querySelector("message").textContent;
			// 								MessageBox.error(errorXML);
			// 							}
			// 						});
			// 				}
			// 			}
			// 		});
			// 	}
		},
		onFragClose: function (oEvent) {
			oEvent.getSource().getParent().close();
		},
		onMaterialPress: function (oEvent) {
			var LineItemData = oEvent.getSource().getParent().getBindingContext("detailModel").getObject();
			var materialData = [];
			materialData.push(LineItemData);
			if (!this._oPopoverFragment) {
				this._oPopoverFragment = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.DetailPopoverFragment", this);
				this.TableTempId = sap.ui.getCore().byId("TableTempId").clone();
				this.getView().addDependent(this._oPopoverFragment);
			}
			this._oPopoverFragment.setModel(new JSONModel(materialData), "materialDescModel");
			this._oPopoverFragment.openBy(oEvent.getSource());
			// sap.ui.getCore().byId("DeliveryTableId").bindAggregation("items", {
			// 	path: "/SubcontractMaterialSet?$filter=Ebeln eq '" + this.Schedule_No + "'and Ebelp  eq '" + LineItemData.Item_No + "'",
			// 	template: this.TableTempId
			// });
		}

		/*	onQuantityPress: function(oQuantity) {
				if (!this.QuantFrag) {
					this.QuantFrag = sap.ui.xmlfragment("sap.fiori.asncreationsa.view.SAFragRequiredQuan", this);
					this.getView().addDependent(this.QuantFrag);
				}

				var sPath = oQuantity.getSource().getBindingContext("detailModel").sPath;
				var data = this.detailModel.getProperty(sPath);
				this.popOverModel.setData(data);
				this.QuantFrag.setModel(this.popOverModel);

				this.QuantFrag.openBy(oQuantity.getSource());

			}*/
	});

});