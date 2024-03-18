sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox"],function(e,t){"use strict";return e.extend("sap.fiori.asncreationsa.controller.SAAsnCreate",{onInit:function(){this.oDataModel=sap.ui.getCore().getModel("oDataModel");this.getView().addStyleClass("sapUiSizeCompact");this.router=sap.ui.core.UIComponent.getRouterFor(this);this.router.attachRouteMatched(this.handleRouteMatched,this);this.asnModel=new sap.ui.model.json.JSONModel;this.asnModel.setSizeLimit(1e8);this.getView().setModel(this.asnModel,"asnModel");this.detailHeaderModel=new sap.ui.model.json.JSONModel;this.detailHeaderModel.setSizeLimit(1e3);this.getView().setModel(this.detailHeaderModel,"detailHeaderModel");this.getView().byId("AsnCreateTable").setSticky(["ColumnHeaders","HeaderToolbar"]);this.dateConfirmationModel=new sap.ui.model.json.JSONModel;this.getView().setModel(this.dateConfirmationModel,"DateConfirmationModel");this.popOverModel=new sap.ui.model.json.JSONModel;this.byId("uploadSet").attachEvent("openPressed",this.onOpenPressed,this)},handleRouteMatched:function(e){var a=this.getView().getModel();var r=this.byId("uploadSet");r.removeAllItems();if(e.getParameter("name")==="SAAsnCreate"){var i=this;this.getView().byId("AsnCreateTable").removeSelections(true);var n=new Date;var s=new Date;var o=new Date;o.setDate(n.getDate()-4);s.setDate(n.getDate()+1);var d=e.getParameter("arguments").Schedule_No;this.Schedule_No=d.replace(/-/g,"/");var l=sessionStorage.getItem("unitCode")||"P01";this.AddressCodeASNSA=sessionStorage.getItem("AddressCodeASNSA")||"JSE-01-01";var a=this.getOwnerComponent().getModel();this.getView().setModel(new sap.ui.model.json.JSONModel({minDate:new Date}),"dateModel");var u="/SchedulingAgreements";a.read(u,{urlParameters:{$expand:"DocumentRows",AddressCode:this.AddressCodeASNSA,UnitCode:l},success:function(e){var a=e.results.find(e=>e.ScheduleNum===i.Schedule_No);if(a){i.detailHeaderModel.setData(a);i.detailHeaderModel.refresh(true);i.asnModel.setData(a);i.asnModel.refresh(true);i.asnModel.refresh(true)}else{t.error("Schedule agreement not found")}},error:function(e){var a=JSON.parse(e.response.body);t.error(a.error.message.value)}})}sap.ui.core.BusyIndicator.hide()},onNavBack:function(){jQuery.sap.require("sap.ui.core.routing.History");var e=sap.ui.core.routing.History.getInstance(),t=e.getPreviousHash();if(t!==undefined){history.go(-1)}else{var a=true;this.router.navTo("SAMaster",{},a)}},formatASNdates:function(e){const t=e.split("/");const a=parseInt(t[2],10);const r=parseInt(t[1],10)-1;const i=parseInt(t[0],10);const n=new Date(a,r,i);const s=n.getTimezoneOffset()*6e4;const o=new Date(n.getTime()-s);const d=o.toISOString().split("T")[0]+"T00:00:00";return d+"+05:30"},onAsnSave:function(e){var a=this;var r=this.getOwnerComponent().getModel();this.data=this.asnModel.getData();var i={UnitCode:sessionStorage.getItem("unitCode")||"P01",CreatedBy:"Manikandan",CreatedIP:"",RowDetails:[]};var n=this.getView().byId("AsnCreateTable");var s=n.getSelectedContexts();if(!s.length){t.error("No Item Selected");return}else{var o=s.map(function(e){return e.getObject()});for(var d=0;d<o.length;d++){if(!o[d].BalanceQty){t.error("ASN Quantity is required for selected items");sap.ui.core.BusyIndicator.hide();return}else{if(this.data.ManufacturingMonth){var l=this.data.ManufacturingMonth.substring(4,6)+"/"+this.data.ManufacturingMonth.substring(6,8)+"/"+this.data.ManufacturingMonth.substring(0,4);var u=new Date(l);var h=sap.ui.core.format.DateFormat.getDateInstance({pattern:"dd/MM/yyyy"});this.ManufacturingMonth=h.format(u);this.ManufacturingMonth=this.formatASNdates(this.ManufacturingMonth)}if(o[d].TCS===undefined){o[d].TCS=""}if(this.data.TransportName===undefined){this.data.TransportName=""}if(this.data.TransportMode===undefined){this.data.TransportMode=""}if(this.data.DocketNumber===undefined){this.data.DocketNumber=""}if(this.data.GRDate===undefined){this.data.GRDate=""}else if(this.data.GRDate){var l=this.data.GRDate.substring(4,6)+"/"+this.data.GRDate.substring(6,8)+"/"+this.data.GRDate.substring(0,4);var u=new Date(l);var h=sap.ui.core.format.DateFormat.getDateInstance({pattern:"dd/MM/yyyy"});this.GRDate=h.format(u);this.GRDate=this.formatASNdates(this.GRDate)}if(this.data.EwayBillNumber===undefined){this.data.EwayBillNumber=""}if(this.data.EwayBillDate===undefined){this.data.EwayBillDate=""}else if(this.data.EwayBillDate){var l=this.data.EwayBillDate.substring(4,6)+"/"+this.data.EwayBillDate.substring(6,8)+"/"+this.data.EwayBillDate.substring(0,4);var u=new Date(l);var h=sap.ui.core.format.DateFormat.getDateInstance({pattern:"dd/MM/yyyy"});this.EwayBillDate=h.format(u);this.EwayBillDate=this.formatASNdates(this.EwayBillDate)}if(this.data.MillNumber===undefined){this.data.MillNumber=""}if(this.data.MillName===undefined){this.data.MillName=""}if(this.data.PDIRNumber===undefined){this.data.PDIRNumber=""}if(this.data.HeatNumber===undefined){this.data.HeatNumber=""}if(this.data.BatchNumber===undefined){this.data.BatchNumber=""}if(this.data.ManufacturingMonth===undefined){this.ManufacturingMonth=""}if(o[d].Packing===undefined){o[d].Packing="0"}if(o[d].Frieght===undefined){o[d].Frieght="0"}if(o[d].OtherCharges===undefined){o[d].OtherCharges="0"}var c={BillLineNumber:o[d].LineNum,ScheduleNumber:o[d].SchNum_ScheduleNum,ScheduleLineNumber:o[d].SchLineNum,PONumber:o[d].PoNum,IAIVendorCode:this.data.VendorCode,IAIItemCode:o[d].ItemCode,UOM:o[d].UOM,HSNCode:o[d].HSNCode,Rate:o[d].UnitPrice,Quantity:o[d].BalanceQty,PackingAmount:o[d].Packing,Freight:o[d].Frieght,OtherCharges:o[d].OtherCharges,AssValue:o[d].ASSValue.toString(),IGST:o[d].IGST,IGA:o[d].IGA,CGST:o[d].CGST,CGA:o[d].CGA,SGST:o[d].SGST,SGA:o[d].SGA,TCS:o[d].TCS,TCA:o[d].TCA,LineValue:o[d].LineValue,TransportName:this.data.TransportName,TransportMode:this.data.TransportMode,DocketNumber:this.data.DocketNumber,GRDate:this.GRDate,Packaging:"0",WeightPerKG:o[d].WeightInKG,EwayBillNumber:this.data.EwayBillNumber,EwayBillDate:this.EwayBillDate,MillNumber:this.data.MillNumber,MillName:this.data.MillName,PDIRNumber:this.data.PDIRNumber,HeatNumber:this.data.HeatNumber,BatchNumber:this.data.BatchNumber,ManufacturingMonth:this.ManufacturingMonth};i.RowDetails.push(c)}}var g=JSON.stringify(i);this.hardcodedURL="";if(window.location.href.includes("site")){this.hardcodedURL=jQuery.sap.getModulePath("sap.fiori.asncreationsa")}var m=this.hardcodedURL+`/asnsa/odata/v4/catalog/PostASN`;$.ajax({type:"POST",headers:{"Content-Type":"application/json"},url:m,data:JSON.stringify({asnData:g}),context:this,success:function(e,a,r){this.AsnNum=e.d.PostASN;t.success(this.AsnNum+" ASN created succesfully",{actions:[sap.m.MessageBox.Action.OK],icon:sap.m.MessageBox.Icon.SUCCESS,title:"Success",onClose:function(e){if(e==="OK"){sap.fiori.asncreationsa.controller.formatter.onNavBack()}}});this.onAsnSaveDB()}.bind(this),error:function(e){var a=JSON.parse(e.responseText);t.error(a.error.message.value)}})}},onAsnSaveDB:function(){var e=this;var a=this.getOwnerComponent().getModel();this.data=this.asnModel.getData();var r={SchNum_ScheduleNum:this.data.ScheduleNum,AsnNum:this.AsnNum,DocketNumber:this.data.DocketNumber,GRDate:this.data.GRDate,TransportName:this.data.TransportName,TransportMode:this.data.TransportMode,EwayBillNumber:this.data.EwayBillNumber,EwayBillDate:this.data.EwayBillDate,MillNumber:this.data.MillNumber,MillName:this.data.MillName,PDIRNumber:this.data.PDIRNumber,HeatNumber:this.data.HeatNumber,BatchNumber:this.data.BatchNumber,ManufacturingMonth:this.data.ManufacturingMonth,PlantName:this.data.PlantName,PlantCode:this.data.PlantCode,VendorCode:this.data.VendorCode};var i=[];var n=this.getView().byId("AsnCreateTable");var s=n.getSelectedContexts();if(!s.length){t.error("No Item Selected");return}else{var o=s.map(function(e){return e.getObject()});for(var d=0;d<o.length;d++){if(!o[d].BalanceQty){t.error("ASN Quantity is required for selected items");sap.ui.core.BusyIndicator.hide();return}else{o[d].ASSValue=o[d].ASSValue.toString();i.push(o[d])}}a.create("/ASNListHeader",r,null,function(e,t){},function(e){try{var a=JSON.parse(e.response.body);t.error(a.error.message.value)}catch(a){var r=jQuery.parseXML(e.getParameter("responseText")).querySelector("message").textContent;t.error(r)}});for(var d=0;d<i.length;d++){a.create("/ASNList",i[d],null,function(e,t){},function(e){try{var a=JSON.parse(e.response.body);t.error(a.error.message.value)}catch(a){var r=jQuery.parseXML(e.getParameter("responseText")).querySelector("message").textContent;t.error(r)}})}var l=this.AsnNum.replace(/\//g,"-");var u={AsnNum:l};if(this.item){this._createEntity(this.item,l).then(()=>{this._uploadContent(this.item,l)}).catch(e=>{console.log("Error: "+e)})}}},handleLinkPress:function(e){if(!this._oPopover){this._oPopover=sap.ui.xmlfragment("sap.fiori.asncreationsa.view.PricePopoverFragment",this);this.getView().addDependent(this._oPopover)}var t=e.getSource().getBindingContext("asnModel").sPath;var a=this.asnModel.getProperty(t);this.popOverModel.setData(a);this._oPopover.setModel(this.popOverModel);this._oPopover.openBy(e.getSource())},onAsnCancel:function(){this.router.navTo("PoSplit")},onQuanPress:function(e){var t=this;if(!this.QuantFrag){this.QuantFrag=sap.ui.xmlfragment("sap.fiori.asncreationsa.view.SAFragRequiredQuan",this);this.getView().addDependent(this.QuantFrag)}var a=e.getSource().getBindingContext("asnModel").getPath();var r=this.asnModel.getProperty(a);this.oDataModel.read("/S_LINEITEMSSet?$filter=Schedule_No eq '"+r.Ebeln+"' and Schedule_Item eq '"+r.Ebelp+"' and Material_No eq '"+r.Matnr+"' and Uom eq '"+r.Uom+"'",null,null,false,function(e,a){t.popOverModel.setData(e);t.QuantFrag.setModel(t.popOverModel,"itemModel");t.popOverModel.refresh(true)});this.QuantFrag.openBy(e.getSource())},onAfterItemAdded:function(e){this.item=e.getParameter("item")},onUploadCompleted:function(e){var t=this.byId("uploadSet");var a=e.getParameter("item");var r=a.getUploadUrl();var i=r;a.setUrl(i);t.getBinding("items").refresh();t.invalidate()},_createEntity:function(e,t){this.hardcodedURL="";if(window.location.href.includes("site")){this.hardcodedURL=jQuery.sap.getModulePath("sap.fiori.asncreationsa")}var a=this.getView().getModel();var r={AsnNum:t,mediaType:e.getMediaType(),fileName:e.getFileName(),size:e.getFileObject().size,url:this.hardcodedURL+`/asnsa/odata/v4/catalog/Files(AsnNum='${t}')/content`};return new Promise((e,i)=>{a.update(`/Files(AsnNum='${t}')`,r,{success:function(){e()},error:function(e){console.log("Error: ",e);i(e)}})})},_uploadContent:function(e,t){this.hardcodedURL="";if(window.location.href.includes("site")){this.hardcodedURL=jQuery.sap.getModulePath("sap.fiori.asncreationsa")}var a=this.hardcodedURL+`/asnsa/odata/v4/catalog/Files(AsnNum='${t}')/content`;e.setUploadUrl(a);var r=this.byId("uploadSet");r.setHttpRequestMethod("PUT");r.uploadItem(e)},onOpenPressed:function(e){e.preventDefault();var t=e.getParameter("item");this._fileName=t.getFileName();this._download(t).then(e=>{var t=window.URL.createObjectURL(e);var a=document.createElement("a");a.href=t;a.setAttribute("download",this._fileName);document.body.appendChild(a);a.click();document.body.removeChild(a)}).catch(e=>{console.log(e)})},_download:function(e){console.log("_download");var t={url:e.getUrl(),method:"GET",xhrFields:{responseType:"blob"}};return new Promise((e,a)=>{$.ajax(t).done((t,a,r)=>{e(t)}).fail(e=>{a(e)})})},onDeliveryCost:function(e){var t=this.getView().byId("invoiceAmtId").getValue().trim();unplannedAmount=Math.abs(parseFloat(unplannedAmount));unplannedAmount=unplannedAmount?unplannedAmount:0;var a=+t+ +unplannedAmount;this.getView().byId("invoiceValueId").setValue(a.toFixed(2))},onEditPress:function(e){this.byId("invoiceValueId").setEditable(true)},onDateFilter:function(e){var a=this.byId("FromDateId").getValue();var r=this.byId("ToDateId").getValue();var i=this.getView().byId("AsnCreateTable").getBinding("items");if(a||r){var n=new sap.ui.model.Filter({filters:[new sap.ui.model.Filter({path:"ShipDate",operator:sap.ui.model.FilterOperator.LE,value1:r}),new sap.ui.model.Filter({path:"ShipDate",operator:sap.ui.model.FilterOperator.GE,value1:a})],and:true});i.filter(n)}else{t.error("No Dates are Selected")}},onDateFilterClear:function(e){this.byId("FromDateId").setValue("");this.byId("ToDateId").setValue("");this.getView().byId("AsnCreateTable").getBinding("items").filter([])},onLinkPress:function(e){var a=this;var r=e.getSource().getParent().getBindingContext("asnModel").getObject();if(!this._oPopoverFragment){this._oPopoverFragment=sap.ui.xmlfragment("sap.fiori.asncreationsa.fragment.DatePopoverFragment",this);this._oPopoverFragment.setModel(this.dateConfirmationModel);this.getView().addDependent(this._oPopoverFragment)}this.oDataModel.read("/ConfirmationDateSet?$filter=Ebeln eq '"+r.Schedule_No+"'and Ebelp  eq '"+r.Ebelp+"' and Etens eq '"+r.Etenr+"'",null,null,false,function(e,t){a.dateConfirmationModel.setData(e);a.dateConfirmationModel.refresh(true)},function(e){var a=JSON.parse(e.response.body);t.error(a.error.message.value)});this._oPopoverFragment.openBy(e.getSource())},onTypeMissmatch:function(e){t.error("Only PDF files are allowed.")},onFromDateChange:function(e){var t=this.getView().byId("FromDateId").getDateValue();this.getView().byId("ToDateId").setMinDate(t)},onMaterialLiveChange:function(e){var t=e.getParameter("newValue")||e.getParameter("query")||"";var a=[];if(t){a.push(new sap.ui.model.Filter("Matnr",sap.ui.model.FilterOperator.Contains,t));a.push(new sap.ui.model.Filter("Maktx",sap.ui.model.FilterOperator.Contains,t))}else{a.push(new sap.ui.model.Filter("Matnr",sap.ui.model.FilterOperator.EQ,""));a.push(new sap.ui.model.Filter("Maktx",sap.ui.model.FilterOperator.Contains,""))}this.byId("AsnCreateTable").getBinding("items").filter(new sap.ui.model.Filter({filters:a}))},onQuantityChange:function(e){const t=e.getParameter("newValue"),a=e.getSource().getParent().getBindingContext("asnModel").getObject();var r=e.getSource().getParent().getBindingContextPath().split("/")[3];var i=this.asnModel.getData().DocumentRows.results;i[r].BalanceQty=t;i[r].ASSValue=parseFloat(i[r].BalanceQty)*parseFloat(i[r].UnitPrice);if(i[r].Packing){i[r].ASSValue=parseFloat(i[r].ASSValue)+parseFloat(i[r].Packing)}if(i[r].Frieght){i[r].ASSValue=parseFloat(i[r].ASSValue)+parseFloat(i[r].Frieght)}if(i[r].OtherCharges){i[r].ASSValue=parseFloat(i[r].ASSValue)+parseFloat(i[r].OtherCharges)}this.asnModel.refresh(true)},onPackChange:function(e){const t=e.getParameter("value")||0;var a=e.getSource().getParent().getBindingContextPath().split("/")[3];var r=this.asnModel.getData().DocumentRows.results;r[a].Packing=t;if(r[a].Frieght===undefined){r[a].Frieght="0"}if(r[a].OtherCharges===undefined){r[a].OtherCharges="0"}r[a].ASSValue=parseFloat(r[a].BalanceQty)*parseFloat(r[a].UnitPrice)+parseFloat(r[a].Packing)+parseFloat(r[a].Frieght)+parseFloat(r[a].OtherCharges);this.asnModel.refresh(true)},onFreightChange:function(e){const t=e.getParameter("value")||0;var a=e.getSource().getParent().getBindingContextPath().split("/")[3];var r=this.asnModel.getData().DocumentRows.results;r[a].Frieght=t;if(r[a].Packing===undefined){r[a].Packing="0"}if(r[a].OtherCharges===undefined){r[a].OtherCharges="0"}r[a].ASSValue=parseFloat(r[a].BalanceQty)*parseFloat(r[a].UnitPrice)+parseFloat(r[a].Packing)+parseFloat(r[a].Frieght)+parseFloat(r[a].OtherCharges);this.asnModel.refresh(true)},onOtherChange:function(e){const t=e.getParameter("value")||0;var a=e.getSource().getParent().getBindingContextPath().split("/")[3];var r=this.asnModel.getData().DocumentRows.results;r[a].OtherCharges=t;if(r[a].Frieght===undefined){r[a].Frieght="0"}if(r[a].Packing===undefined){r[a].Packing="0"}r[a].ASSValue=parseFloat(r[a].BalanceQty)*parseFloat(r[a].UnitPrice)+parseFloat(r[a].Packing)+parseFloat(r[a].Frieght)+parseFloat(r[a].OtherCharges);this.asnModel.refresh(true)}})});