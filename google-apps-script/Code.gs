/******************************************************
 BENCHMARK GROUP | RMG MATERIAL & PRODUCTION CONTROL TOWER
 Google Sheets API
 Sheets:
 ORDER MASTER
 MATERIAL PO
 STORE
 CUTTING
 SEWING
 FINISHING
 FG PACKING
 SHIPMENT
 RECONCILIATION
******************************************************/

const SHEETS = {
  "ORDER MASTER":["Order ID","Buyer","PO","Style","Color","Order Qty","Ship Date","Factory","Merchandiser","Product","SMV","Destination","Priority"],
  "MATERIAL PO":["Date","PO","Style","Color","Material","Supplier","Required Qty","PO Qty","Required Date"],
  "STORE":["Date","PO","Style","Color","Material","GRN","Received Qty"],
  "CUTTING":["Date","Factory","PO","Style","Color","Input","Cut Qty","Reject","Re-cut"],
  "SEWING":["Date","Factory","Line","PO","Style","Color","Input","Output","Reject"],
  "FINISHING":["Date","Factory","PO","Style","Color","Input","Output","Rework","Reject"],
  "FG PACKING":["Date","Factory","PO","Style","Color","FG Qty","Packed Qty","Carton Qty","Ready Qty"],
  "SHIPMENT":["Date","PO","Style","Color","Shipped Qty","Destination"],
  "RECONCILIATION":["PO","Style","Color","Order Qty","Material In-House","Cut Qty","Sewing Output","Finishing Output","FG Qty","Shipped Qty","Shipment Balance","Production Balance","Material Shortage","Ship Date","Days Left","Status"]
};

function setupSystem(){
  const ss=SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(name=>{
    let sh=ss.getSheetByName(name)||ss.insertSheet(name);
    sh.clear();
    sh.getRange(1,1,1,SHEETS[name].length).setValues([SHEETS[name]]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,SHEETS[name].length).setFontWeight("bold");
  });
  rebuildReconciliation();
}

function doGet(){ return ContentService.createTextOutput(JSON.stringify({ok:true,service:"Benchmark Group Control Tower API"})).setMimeType(ContentService.MimeType.JSON); }

function doPost(e){
  try{
    const body=JSON.parse(e.postData.contents||"{}");
    const sheetName=body.sheet;
    if(!SHEETS[sheetName]) throw new Error("Unknown sheet: "+sheetName);
    const ss=SpreadsheetApp.getActive();
    const sh=ss.getSheetByName(sheetName)||ss.insertSheet(sheetName);
    const headers=SHEETS[sheetName];
    if(sh.getLastRow()===0) sh.appendRow(headers);
    const row=headers.map(h=>body[h]!==undefined?body[h]:"");
    sh.appendRow(row);
    if(sheetName!=="RECONCILIATION") rebuildReconciliation();
    return json({ok:true,sheet:sheetName});
  }catch(err){ return json({ok:false,error:String(err)}); }
}

function rebuildReconciliation(){
  const ss=SpreadsheetApp.getActive(), out=ss.getSheetByName("RECONCILIATION");
  if(!out) return;
  const order=readObjects_(ss.getSheetByName("ORDER MASTER"));
  const material=readObjects_(ss.getSheetByName("STORE"));
  const cut=readObjects_(ss.getSheetByName("CUTTING"));
  const sew=readObjects_(ss.getSheetByName("SEWING"));
  const fin=readObjects_(ss.getSheetByName("FINISHING"));
  const fg=readObjects_(ss.getSheetByName("FG PACKING"));
  const ship=readObjects_(ss.getSheetByName("SHIPMENT"));
  const rows=order.map(o=>{
    const po=o["PO"], style=o["Style"], color=o["Color"], qty=num_(o["Order Qty"]);
    const sum=(arr,key)=>arr.filter(x=>x["PO"]===po).reduce((s,x)=>s+num_(x[key]),0);
    const mat=sum(material,"Received Qty"), cq=sum(cut,"Cut Qty"), so=sum(sew,"Output"), fo=sum(fin,"Output"), fq=sum(fg,"FG Qty"), sq=sum(ship,"Shipped Qty");
    const shortage=Math.max(0, sumReq_(ss,po,style,color)-mat);
    const days=Math.ceil((new Date(o["Ship Date"]).getTime()-new Date().setHours(0,0,0,0))/86400000);
    let status="ON TRACK"; if(shortage>0 || (days<=3 && qty-sq>qty*.35)) status="CRITICAL"; else if(qty-sq>qty*.25) status="WATCH";
    return [po,style,color,qty,mat,cq,so,fo,fq,sq,qty-sq,qty-fq,shortage,o["Ship Date"],days,status];
  });
  out.clearContents(); out.getRange(1,1,1,SHEETS.RECONCILIATION.length).setValues([SHEETS.RECONCILIATION]);
  if(rows.length) out.getRange(2,1,rows.length,SHEETS.RECONCILIATION.length).setValues(rows);
  out.setFrozenRows(1);
}
function sumReq_(ss,po,style,color){ const a=readObjects_(ss.getSheetByName("MATERIAL PO")); return a.filter(x=>x["PO"]===po&&x["Style"]===style&&x["Color"]===color).reduce((s,x)=>s+num_(x["Required Qty"]),0); }
function readObjects_(sh){ if(!sh||sh.getLastRow()<2) return []; const v=sh.getDataRange().getValues(), h=v.shift(); return v.map(r=>Object.fromEntries(h.map((x,i)=>[String(x),r[i]]))); }
function num_(x){ const n=Number(String(x).replace(/,/g,"")); return isNaN(n)?0:n; }
function json(x){ return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON); }
