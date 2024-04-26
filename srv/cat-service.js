// const cds = require('@sap/cds');
const axios = require('axios');

module.exports = (srv) => {

    const { GetASNHeaderList, GetASNDetailList } = srv.entities;

    srv.on('READ', GetASNHeaderList, async (req) => {
        const params = req._queryOptions;
        const loginid = req.headers.loginid;
        let results = await getASNHeaderList(params,loginid);
        if (results.error) req.reject(500, results.error);
         // Checking for search parameter
         const searchVal = req._queryOptions && req._queryOptions.$search;
         if (searchVal) {
             let cleanedSearchVal = searchVal.trim().replace(/"/g, '');
            //  if(cleanedSearchVal === 'Invoice Submitted' || cleanedSearchVal === 'Invoice Submission Pending'){
            //      results = results.filter(asn =>
            //          (asn.HasAttachments === cleanedSearchVal)
            //      );
            //  }else{
             results = results.filter(asn =>
                asn.ASNNumber.includes(cleanedSearchVal)
             );
            //  }
         }
        return results;

    });

    srv.on('READ', GetASNDetailList, async (req) => {
        const { username, AddressCode, ASNNumber, UnitCode } = req._queryOptions;
        const loginid = req.headers.loginid;
        const results = await getASNDetailList(username, AddressCode, ASNNumber, UnitCode,loginid);
        if (results.error) req.reject(500, results.error);
        return results;
    });

    srv.on('PostASNCancellation', async (req) => {
        const asnDataString = req.data.asnData;
        const asnDataParsed = JSON.parse(asnDataString);
        const asnDataFormatted = JSON.stringify(asnDataParsed, null, 2);
        const loginid = req.headers.loginid;
        try {
            const response = await PostASNCancellation(asnDataFormatted, loginid);
            return response;
        } catch (error) {
            console.error('Error in PostASNCancellation API call:', error);
            req.reject(400,`${error.message}`);
        }
    });
};

async function getASNHeaderList(params, loginid) {

    try {
        const {
            username, AddressCode, PoNumber, ASNNumber, ASNFromdate, ASNTodate,
            InvoiceStatus, MRNStatus, ApprovedBy
        } = params;

        const token = await generateToken(loginid),
            legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
            query : `GET GetASNHeaderList?RequestBy='${loginid}'&AddressCode='${AddressCode}'&PoNumber='${PoNumber}'&ASNNumber='${ASNNumber}'&ASNFromdate='${ASNFromdate}'&ASNTodate='${ASNTodate}'&InvoiceStatus='${InvoiceStatus}'&MRNStatus='${MRNStatus}'&ApprovedBy='${ApprovedBy}'`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {}
        });

        if (response.d) {
            return JSON.parse(response.d);
        } else {
            return {
                error: response.ErrorDescription
            }
        }
    } catch (error) {
        console.error('Error in getASNHeaderList API call:', error);
        throw new Error(error);
    }
}

async function getASNDetailList(username, AddressCode, ASNNumber, UnitCode, loginid) {
    try {

        const token = await generateToken(loginid),
        legApi = await cds.connect.to('Legacy'),
        response = await legApi.send({
            query: `GET GetASNDetailList?RequestBy='${loginid}'&AddressCode='${AddressCode}'&ASNNumber='${ASNNumber}'&UnitCode='${UnitCode}'`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {}
        });

        if (response.d) {
            return JSON.parse(response.d);
        } else {
            return {
                error: response.ErrorDescription
            }
        }
    } catch (error) {
        console.error('Error in getASNDetailList API call:', error);
        throw new Error(error);
    }
}

async function PostASNCancellation(asnData,loginid) {
    try {
        const token = await generateToken(loginid),
        legApi = await cds.connect.to('Legacy'),
        response = await legApi.send({
            query: `POST PostASNCancellation`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: asnData
        });

        if (response.SuccessCode) {
            return response.SuccessCode;
        } else {
            throw new Error(response.ErrorDescription || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error in ASN Cancellation:', error);
        throw error;
    }
}

async function generateToken(username) {
    try {
        const legApi = await cds.connect.to('Legacy'),
            response = await legApi.send({
            query: `POST GenerateToken`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "InputKey": username
            }
        });

        if (response.d) {
            return response.d;
        } else {
            console.error('Error parsing token response:', response.data);
            throw new Error('Error parsing the token response from the API.');
        }
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Unable to generate token.');
    }
}
