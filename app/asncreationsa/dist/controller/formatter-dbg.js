jQuery.sap.declare("sap.fiori.asncreationsa.controller.formatter");

sap.fiori.asncreationsa.controller.formatter = {

	onNavBack: function () {
		var oHistory = sap.ui.core.routing.History.getInstance();
		var sPreviousHash = oHistory.getPreviousHash();

		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("SAMaster", {}, true);
		}

	},
	formatAmount: function (oAmount) {
		if (oAmount) {
			var oFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				"groupingEnabled": true,
				"groupingSeparator": ',',
				"groupingSize": 3,
				"decimalSeparator": "." 
			});
			return oFormat.format(oAmount);
		}
		return "";
	},

	formatDate: function (oDate) {
		if (oDate !== "" && oDate !== null && oDate !== undefined) {

			// var date = oDate.substring(4, 6) + "/" + oDate.substring(6, 8) + "/" + oDate.substring(0, 4);

			// var DateInstance = new Date(date);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MMM dd, yyyy"
			});
			return dateFormat.format(DateInstance);
		}
		return "";
	},

	selectEnabled: function (oConfirm) {
		if (oConfirm == "Not Confirmed") {
			return true;
		}
		return false;
	},
	LinkEnabled: function (oValue) {
		if (oValue == "SUB01") {
			return true;
		}
		return false;
	},
	statusCheckConf: function (oStatus) {
		if (oStatus === "Confirmed") {
			return "Success";
		} else if (oStatus === "Partially Confirmed") {
			return "Warning";
		} else if (oStatus === "Confirmation Required") {
			return "Error";
		} else {
			return "None";
		}
	},
	statusCheck: function (oStatus) {
		if (oStatus === "Closed") {
			return "Success";
		} else if (oStatus === "Partially") {
			return "Warning";
		} else if (oStatus === "Open") {
			return "Error";
		} 
		else {
			return "None";
		}
	},
	checkSelection: function (indicator) {
		if (indicator === "true") {
			return true;
		} else {
			return false;
		}
	},
	createASNBtn: function (oValue) {
		if (oValue == "X") {
			return true;
		}
		return false;
	},

	getPercentSign: function (taxValue, taxRate) {
		if (taxValue && taxRate) {
			taxValue = parseFloat(taxValue).toFixed(2).toString();
			return taxValue + " (" + taxRate + "%)";
		}
		return "";
	},

	confirmBtnVisible: function (validity) {
			// as per mail date 23/03/2023
		// if (validity === false) {
		// 	return true;
		// } else {
		// 	return false;
		// }
		return true;
	},

	asnCreateVisible: function (status, validity) {
		if (status !== undefined) {
			if (status === "New") {
				return false;
			} else {
				// as per mail date 23/03/2023
				// if (validity === false) {
				// 	return true;
				// } else {
				// 	return false;
				// }
				return true;
			}
		} else {
			return true;
		}
	}
};