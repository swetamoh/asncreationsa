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

			this.detailModel = new sap.ui.model.json.JSONModel();
			this.detailModel.setSizeLimit(10000000);
			this.getView().setModel(this.detailModel, "detailModel");

			this.getView().setModel(new JSONModel({}), "DecisionModel");

			this.getView().addStyleClass("sapUiSizeCompact");
			this.byId("uploadSet").attachEvent("openPressed", this.onOpenPressed, this);
			// this.getView().byId("ObjectId").onAfterRendering = function () {
			// 	sap.m.ObjectHeader.prototype.onAfterRendering.apply(this, arguments);
			// 	this.$().find('.sapMOHTitleDiv').find('.sapMText').css('color', "#af2323");
			// };

		},

		handleRouteMatched: function (oEvent) {

			if (oEvent.getParameter("name") === "SADetail") {

				sap.ui.core.BusyIndicator.show();
				this.odata = {};
				var that = this;
				var oModel = this.getOwnerComponent().getModel();
				this.LoggedUser = sessionStorage.getItem("LoggedUser") || "rajeshsehgal@impauto.com";
				var data = oEvent.getParameter("arguments");
				this.AsnNumber = data.AsnNumber.replace(/-/g, '/');
				this.AsnNum = data.AsnNumber;
				this.UnitCode = data.UnitCode;
				this.AddressCode = data.AddressCode;
				this.ASNStatus = data.ASNStatus;

				var oUploadSet = this.byId("uploadSet");
				oUploadSet.removeAllItems();
				that.detailModel.setData([]);
				that.detailModel.refresh();

				oModel.read("/GetASNDetailList", {
					urlParameters: {
						AddressCode: this.AddressCode,
						ASNNumber: this.AsnNumber,
						UnitCode: this.UnitCode
					},
					success: function (oData) {
						sap.ui.core.BusyIndicator.hide();
						that.detailModel.setData(oData);
						that.detailModel.getData().ASNStatus = that.ASNStatus;
						that.detailModel.refresh();
						that._fetchFilesForPoNum(that.AsnNum);
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						var value = JSON.parse(oError.response.body);
						MessageBox.error(value.error.message.value);
					}
				});
			}
		},
		_fetchFilesForPoNum: function (AsnNum) {
			var that = this;
			var oModel = this.getView().getModel("catalog");
			var oUploadSet = this.byId("uploadSet");
			oUploadSet.setUploadEnabled(true);
			oUploadSet.removeAllItems();
			this.userType = this.getView().getModel().getHeaders().loginType;
			oModel.read("/Files", {
				filters: [new sap.ui.model.Filter("AsnNum", sap.ui.model.FilterOperator.EQ, AsnNum)],
				success: function (oData) {
					oData.results.forEach(function (fileData) {
						var oItem = new sap.m.upload.UploadSetItem({
							fileName: fileData.fileName,
							mediaType: fileData.mediaType,
							url: fileData.url,
							attributes: [
								new sap.m.ObjectAttribute({ title: "Uploaded By", text: fileData.createdBy }),
								new sap.m.ObjectAttribute({ title: "Uploaded on", text: fileData.createdAt }),
								new sap.m.ObjectAttribute({ title: "File Size", text: fileData.size.toString() })
							]
						});
						if(that.userType === "P" && that.ASNStatus !== "PENDING"){
							that.byId("uploadSet").setUploadEnabled(false);
							oItem.setVisibleEdit(false).setVisibleRemove(false);
						}
						oUploadSet.addItem(oItem);
					});
				},
				error: function (oError) {
					console.log("Error: " + oError)
				}
			});
		},
		onOpenPressed: function (oEvent) {
			oEvent.preventDefault();
			//var item = oEvent.getSource();
			var item = oEvent.getParameter("item");
			this._fileName = item.getFileName();
			this._download(item)
				.then((blob) => {
					var url = window.URL.createObjectURL(blob);
					var link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', this._fileName);
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				})
				.catch((err) => {
					console.log(err);
				});
		},
		_download: function (item) {
			console.log("_download")
			var settings = {
				url: item.getUrl(),
				method: "GET",
				xhrFields: {
					responseType: "blob"
				}
			}

			return new Promise((resolve, reject) => {
				$.ajax(settings)
					.done((result, textStatus, request) => {
						resolve(result);
					})
					.fail((err) => {
						reject(err);
					})
			});
		},

		onCancelAsn: function (evt) {
			this.getView().getModel("DecisionModel").setData({});
			const remarksFrag = sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.Remarks", this);
			this.getView().addDependent(remarksFrag);
			remarksFrag.open();
		},
		onSubmit: function (evt) {
			this.dialogSource = evt.getSource();
			const data = this.getView().getModel("DecisionModel").getData();
			if (data.Reason !== "") {
				this.Reason = data.Reason;
				this.onFinalCancelAsn();
			} else {
				MessageBox.error("Please fill reason to proceed");
			}
		},
		onDialogClose: function (evt) {
			evt.getSource().destroy();
		},

		onDialogCancel: function (evt) {
			evt.getSource().getParent().destroy();
		},
		onFinalCancelAsn: function () {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var form = {
				"UnitCode": this.UnitCode,
				"OprCode": this.AddressCode,
				"ASNNumber": this.AsnNumber,
				"Reason": this.Reason,
				"CreatedBy": this.getView().getModel().getHeaders().loginId,
				"CreatedIP": ""
			};
			var formdatastr = JSON.stringify(form);
			this.hardcodedURL = "";
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.asncreationsa");
			}
			var sPath = this.hardcodedURL + `/asnsa/odata/v4/catalog/PostASNCancellation`;
			$.ajax({
				type: "POST",
				headers: {
					'loginid': that.getView().getModel().getHeaders().loginId,
					'Content-Type': 'application/json'
				},
				url: sPath,
				data: JSON.stringify({
					asnData: formdatastr
				}),
				context: this,
				success: function (data, textStatus, jqXHR) {
					that.dialogSource.getParent().destroy();
					sap.ui.core.BusyIndicator.hide();
					//that.AsnNum = data.d.PostASNCancellation;
					MessageBox.success(" ASN cancelled succesfully", {
						actions: [sap.m.MessageBox.Action.OK],
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						onClose: function (oAction) {
							if (oAction === "OK") {
								that.router.navTo('SAMaster');
							}
						}
					});
				}.bind(this),
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
					that.dialogSource.getParent().destroy();
					var errormsg = JSON.parse(error.responseText)
					MessageBox.error(errormsg.error.message.value);
				}
			});
		},
		getData: function () {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			that.detailModel.setData([]);
			that.detailModel.refresh();
			oModel.read("/GetASNDetailList", {
				urlParameters: {
					AddressCode: this.AddressCode,
					ASNNumber: this.AsnNumber,
					UnitCode: this.UnitCode
				},
				success: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					that.detailModel.setData(oData);
					that.detailModel.refresh();
					that._fetchFilesForPoNum(that.AsnNum);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var value = JSON.parse(oError.response.body);
					MessageBox.error(value.error.message.value);
				}
			});
		},
		onAfterItemAdded: function (oEvent) {
			var itemsAdded = this.byId("uploadSet").getItems();
			if(itemsAdded.length > 0){
				MessageBox.error("Invoice attachment already exists.");
				return;
			}
			this.item = oEvent.getParameter("item");
			this._createEntity(this.item, this.AsnNum)
			.then(() => {
				this._uploadContent(this.item, this.AsnNum);
			})
			.catch((err) => {
				console.log("Error: " + err);
			})
		},

		onUploadCompleted: function (oEvent) {
			var oUploadSet = this.byId("uploadSet");
			var oUploadedItem = oEvent.getParameter("item");
			var sUploadUrl = oUploadedItem.getUploadUrl();

			var sDownloadUrl = sUploadUrl
			oUploadedItem.setUrl(sDownloadUrl);
			oUploadSet.getBinding("items").refresh();
			oUploadSet.invalidate();
			MessageBox.success("Invoice updated successfully");
		},
		_createEntity: function (item, AsnNum) {
			var oModel = this.getView().getModel("catalog");
			this.hardcodedURL = "";
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.asncreationsa");
			}
			var oData = {
				AsnNum: AsnNum,
				mediaType: item.getMediaType(),
				fileName: item.getFileName(),
				size: item.getFileObject().size,
				url: this.hardcodedURL + `/sa/odata/v4/catalog/Files(AsnNum='${AsnNum}')/content`,
				//url: this.getView().getModel().sServiceUrl + `/Files(SchNum_ScheduleNum='${schNum}')/content`

			};

			return new Promise((resolve, reject) => {
				oModel.update(`/Files(AsnNum='${AsnNum}')`, oData, {
					success: function () {
						resolve();
					},
					error: function (oError) {
						console.log("Error: ", oError);
						reject(oError);
					}
				});
			});
		},

		_uploadContent: function (item, AsnNum) {
			this.hardcodedURL = "";
			if (window.location.href.includes("site")) {
				this.hardcodedURL = jQuery.sap.getModulePath("sap.fiori.asncreationsa");
			}
			var url = this.hardcodedURL + `/sa/odata/v4/catalog/Files(AsnNum='${AsnNum}')/content`
			item.setUploadUrl(url);
			var oUploadSet = this.byId("uploadSet");
			oUploadSet.setHttpRequestMethod("PUT")
			oUploadSet.uploadItem(item);
		},

	});

});