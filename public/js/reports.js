function exportCSV(){

 var list = JSON.parse(localStorage.getItem("bookings")||"[]");

 if(!list.length){
  alert("No bookings found");
  return;
 }

 var csv="\ufeffTrack ID,User,Division,Room,Date,Start,End,Status\n";

 list.forEach(function(b){
  csv+= b.trackId + "," + b.user + "," + b.division + "," + b.room + "," + b.date + "," + b.start + "," + b.end + "," + b.status + "\n";
 });

 var blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
 var url=URL.createObjectURL(blob);

 var a=document.createElement("a");
 a.href=url;
 a.download="SFO_Bookings_Report.csv";
 a.click();

 URL.revokeObjectURL(url);
}

function exportPDF(){

 var list = JSON.parse(localStorage.getItem("bookings")||"[]");

 if(!list.length){
  alert("No bookings found");
  return;
 }

 const { jsPDF } = window.jspdf;
 const doc = new jsPDF();

 doc.setFontSize(18);
 doc.text("SFO Bookings Report", 20, 20);

 doc.setFontSize(12);
 let y = 40;

 list.forEach(function(b, index){
  if(y > 270){ // new page
   doc.addPage();
   y = 20;
  }
  doc.text(`Track ID: ${b.trackId}`, 20, y);
  doc.text(`User: ${b.user}`, 20, y+10);
  doc.text(`Division: ${b.division}`, 20, y+20);
  doc.text(`Room: ${b.room}`, 20, y+30);
  doc.text(`Date: ${b.date}`, 20, y+40);
  doc.text(`Time: ${b.start} - ${b.end}`, 20, y+50);
  doc.text(`Status: ${b.status}`, 20, y+60);
  y += 80;
 });

 doc.save("SFO_Bookings_Report.pdf");
}
