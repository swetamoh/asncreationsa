using my.asncancel as my from '../db/data-model';

type SupplierListType : {
    SupplierCode : String;
    SupplierDesc : String;
}

service CatalogService {
    entity GetASNHeaderList as projection on my.GetASNHeaderList;
    entity GetASNDetailList as projection on my.GetASNDetailList;
    function GetSupplierList() returns array of SupplierListType;
    action   PostASNCancellation(asnData : String)
}
