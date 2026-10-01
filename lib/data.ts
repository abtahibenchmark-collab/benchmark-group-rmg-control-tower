export type Order = {
  buyer:string; po:string; style:string; color:string; orderQty:number;
  shipDate:string; factory:string; merchandiser:string; product:string;
  smv:number; destination:string; priority:string;
};
export type Row = {date:string; factory:string; po:string; style:string; color:string; qty:number; reject?:number; line?:string; material?:string; type?:string};

export const orders: Order[] = [
 {buyer:"Dreamwear",po:"PO574571",style:"DS1327",color:"Navy",orderQty:72000,shipDate:"2026-10-08",factory:"Benchmark Exports",merchandiser:"Merch-01",product:"Panty",smv:7.2,destination:"USA",priority:"High"},
 {buyer:"Intex",po:"WM2427",style:"DS3671",color:"Black",orderQty:60480,shipDate:"2026-10-12",factory:"Benchmark Apparels",merchandiser:"Merch-02",product:"Brief",smv:6.8,destination:"EU",priority:"Normal"},
 {buyer:"Dreamwear",po:"PO575090",style:"ABC123",color:"White",orderQty:50000,shipDate:"2026-10-05",factory:"Fabtex",merchandiser:"Merch-03",product:"High Cut",smv:8.1,destination:"USA",priority:"Critical"}
];

export const material = [
 {po:"PO574571",style:"DS1327",color:"Navy",material:"Fabric",required:75000,poQty:76000,received:70000,requiredDate:"2026-10-02"},
 {po:"PO574571",style:"DS1327",color:"Navy",material:"Elastic",required:18000,poQty:19000,received:18000,requiredDate:"2026-10-02"},
 {po:"WM2427",style:"DS3671",color:"Black",material:"Fabric",required:63000,poQty:63000,received:54000,requiredDate:"2026-10-05"},
 {po:"PO575090",style:"ABC123",color:"White",material:"Fabric",required:52000,poQty:50000,received:32000,requiredDate:"2026-10-01"}
];

export const production = [
 {po:"PO574571",style:"DS1327",cut:65000,sewingInput:58000,sewingOutput:52000,finish:46000,fg:42000,ship:30000},
 {po:"WM2427",style:"DS3671",cut:47000,sewingInput:39000,sewingOutput:34000,finish:28000,fg:24000,ship:10000},
 {po:"PO575090",style:"ABC123",cut:36000,sewingInput:29000,sewingOutput:23000,finish:17000,fg:14000,ship:5000}
];

export function money(n:number){return n.toLocaleString("en-US")}
