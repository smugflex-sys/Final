import{r as h,j as e}from"./radix-BlcdY27w.js";import{u as V,o as de,B as R}from"./index-HqEN6CLC.js";import{H as ce,ap as le,_ as me}from"./utils-D_6YOOw8.js";const pe=`
@media print {
  body * {
    visibility: hidden;
  }
  .print-content, .print-content * {
    visibility: visible;
  }
  .print-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    border: none;
    overflow: hidden;
  }
  @page {
    size: A4;
    margin: 0;
    padding: 0;
  }
  .no-print {
    display: none !important;
  }
}
`;function he({student:W,studentClass:P,result:t,detailedScores:x,showActions:w=!1,onDownload:j,onPrint:N,onApprovePrint:$,currentUser:u}){const{schoolSettings:a,loadSchoolSettings:v,students:F,classes:T,teachers:E,scores:g,subjectAssignments:z,subjects:C,affectiveDomains:A,psychomotorDomains:S,loadScoresFromAPI:M,loadSubjectAssignmentsFromAPI:y,loadSubjectsFromAPI:X,loadAffectiveDomainsFromAPI:Y,loadPsychomotorDomainsFromAPI:q,getClassTeacher:J}=V(),[ge,be]=h.useState(!1),[H,I]=h.useState([]);h.useEffect(()=>{a?.resumption_date||v()},[a?.resumption_date,v]),h.useEffect(()=>{const r=document.createElement("style");return r.textContent=pe,document.head.appendChild(r),()=>{document.head.removeChild(r)}},[]);const Q=()=>{window.print()};h.useEffect(()=>{t&&t.student_id&&(re(),Z())},[t]);const Z=async()=>{if(!(!t||!t.student_id))try{await Promise.all([A.length===0&&Y(),S.length===0&&q()])}catch{}},ee=()=>!t||!t.student_id?{}:(Array.isArray(A)?A:[]).find(n=>n.student_id===t.student_id&&n.academic_year===t.academic_year&&n.term===t.term)||{},te=()=>!t||!t.student_id?{}:(Array.isArray(S)?S:[]).find(n=>n.student_id===t.student_id&&n.academic_year===t.academic_year&&n.term===t.term)||{},re=async()=>{if(!(!t||!t.student_id))try{await Promise.all([g.length===0&&M(),z.length===0&&y(),C.length===0&&X()]);let r=L.filter(i=>i.student_id===t.student_id&&i.academic_year===t.academic_year&&i.term===t.term);if(r=r.map(i=>{const n=D.find(d=>d.id===i.subject_assignment_id),c=n?K.find(d=>d.id===n.subject_id):null,_=n?O.find(d=>d.id===n.teacher_id):null,f=L.filter(d=>{const o=D.find(k=>k.id===d.subject_assignment_id);return o&&o.subject_id===n?.subject_id&&d.academic_year===t.academic_year&&d.term===t.term&&d.total>0}).map(d=>d.total||0),p=f.length>0?f.reduce((d,o)=>d+o,0)/f.length:0,U=f.length>0?Math.min(...f):0,G=f.length>0?Math.max(...f):0;return{...i,subject_name:c?c.name:i.subject_name||"Unknown Subject",subject_teacher:_?`${_.firstName} ${_.lastName}`:"Not Assigned",class_average:parseFloat(p.toFixed(2)),class_minimum:U,class_maximum:G}}).sort((i,n)=>i.subject_name.localeCompare(n.subject_name)),x&&x.length>0)I(x);else if(t.scores&&t.scores.length>0){const i=t.scores.map(n=>{const c=D.find(o=>o.id===n.subject_assignment_id),_=c?K.find(o=>o.id===c.subject_id):null,B=c?O.find(o=>o.id===c.teacher_id):null,p=L.filter(o=>{const k=D.find(se=>se.id===o.subject_assignment_id);return k&&k.subject_id===c?.subject_id&&o.academic_year===t.academic_year&&o.term===t.term&&o.total>0}).map(o=>o.total||0),U=p.length>0?p.reduce((o,k)=>o+k,0)/p.length:0,G=p.length>0?Math.min(...p):0,d=p.length>0?Math.max(...p):0;return{...n,subject_name:_?_.name:n.subject_name||"Unknown Subject",subject_teacher:B?`${B.firstName} ${B.lastName}`:"Not Assigned",class_average:parseFloat(U.toFixed(2)),class_minimum:G,class_maximum:d}}).sort((n,c)=>n.subject_name.localeCompare(c.subject_name));I(i)}else I(r)}catch{I([])}},ne=Array.isArray(F)?F:[],ie=Array.isArray(T)?T:[],O=Array.isArray(E)?E:[],D=Array.isArray(z)?z:[],K=Array.isArray(C)?C:[],L=Array.isArray(g)?g:[],b=W||ne.find(r=>r.id===t.student_id),s=P||ie.find(r=>r.id===t.class_id),oe=()=>{if(t?.class_teacher_name&&t.class_teacher_name.trim()!=="")return t.class_teacher_name;if(s?.classTeacher)return s.classTeacher;if(s?.classTeacherId){const r=O.find(i=>i.id===s.classTeacherId);if(r)return`${r.firstName} ${r.lastName}`}if(s?.id){const r=J(s.id);if(r)return`${r.firstName} ${r.lastName}`}return"_________________"},ae=r=>r>=80?{grade:"A",remark:"Excellent"}:r>=70?{grade:"B",remark:"Very Good"}:r>=60?{grade:"C",remark:"Good"}:r>=50?{grade:"D",remark:"Satisfactory"}:r>=45?{grade:"E",remark:"Fair"}:{grade:"F",remark:"Fail"},l=r=>r===5?"Excellent":r===4?"Very Good":r===3?"Good":r===2?"Fair":"Poor",m=r=>{const i={attentiveness:"Attentiveness",honesty:"Honesty",neatness:"Neatness",obedience:"Obedience",sense_of_responsibility:"Sense of Responsibility"},n={attention_to_direction:"Attention to Direction",considerate_of_others:"Considerate of Others",handwriting:"Handwriting",sports:"Sports",verbal_fluency:"Verbal Fluency",works_well_independently:"Works Well Independently"};return i[r]||n[r]||r.replace(/_/g," ").replace(/(?:^|\s)\S/g,c=>c.toUpperCase())};return u?.role==="admin"||t.print_approved,e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
            orientation: portrait;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Times New Roman', serif;
            font-size: 10pt;
            line-height: 1.2;
            width: 100%;
            height: 100vh;
            overflow: hidden;
          }
          
          .print-container {
            width: 100%;
            max-width: 190mm;
            min-height: 277mm;
            margin: 0 auto;
            box-sizing: border-box;
            overflow: hidden;
            page-break-after: always;
            page-break-inside: avoid;
            padding: 4mm;
            background: white;
          }
          
          .print-header {
            page-break-after: auto;
            page-break-inside: avoid;
          }
          
          .print-table {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .print-section {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .print-affective-psychomotor {
            page-break-inside: avoid;
            display: flex !important;
            gap: 2mm !important;
          }
          
          .print-watermark {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 140mm !important;
            height: 140mm !important;
            opacity: 0.12 !important;
            z-index: 0 !important;
            pointer-events: none !important;
            background-size: contain !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
          }
          
          .print-content {
            position: relative !important;
            z-index: 1 !important;
          }
          
          table {
            border-collapse: collapse !important;
            page-break-inside: avoid !important;
          }
          
          tr {
            page-break-inside: avoid !important;
          }
          
          td, th {
            page-break-inside: avoid !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          @media screen {
            .print-only {
              display: none !important;
            }
          }
        }
      `}),e.jsx("div",{className:"print-container bg-white no-print",style:{fontFamily:'"Times New Roman", serif',width:"210mm",height:"297mm",margin:"0 auto",padding:"8mm",boxSizing:"border-box",backgroundColor:"white",overflow:"hidden",position:"relative",border:"3px double #2c3e50",boxShadow:"0 0 20px rgba(0,0,0,0.1)",background:"linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"},children:e.jsxs("div",{className:"print-content",style:{position:"absolute",left:"-8mm",top:"-8mm",width:"210mm",height:"297mm",zIndex:1,textRendering:"geometricPrecision",fontSmooth:"always",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",WebkitTextStroke:"0.01px transparent",textShadow:"0 0 0.01px rgba(0,0,0,0.01)",letterSpacing:"0.01px",lineHeight:"1.1",fontWeight:"500",backgroundColor:"white",padding:"8mm",boxSizing:"border-box",border:"3px double #2c3e50"},children:[e.jsxs("div",{className:"print-header",style:{textAlign:"center",marginBottom:"3mm",padding:"2mm 0"},children:[e.jsx("div",{style:{marginBottom:"1mm"},children:e.jsx("img",{src:de,alt:"School Logo",style:{width:"18mm",height:"18mm",display:"block",margin:"0 auto",borderRadius:"50%",border:"2px solid #2c3e50",objectFit:"cover",backgroundColor:"#ffffff",imageRendering:"auto",WebkitImageRendering:"auto"},onError:r=>{const i=r.target;i.src="./assets/images/school-logo.jpg"}})}),e.jsx("h1",{style:{fontSize:"14pt",fontWeight:"bold",margin:"0.5mm 0",textTransform:"uppercase",color:"#2c3e50",letterSpacing:"1px",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"},children:a.school_name||"SCHOOL NAME"}),e.jsx("p",{style:{fontSize:"8pt",margin:"0.3mm 0",fontStyle:"italic",color:"#555",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"},children:a.school_address||"SCHOOL ADDRESS"}),e.jsx("p",{style:{fontSize:"8pt",margin:"0.3mm 0",color:"#555",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"},children:a.school_email||"school@email.com"}),e.jsx("p",{style:{fontSize:"8pt",margin:"0.3mm 0",color:"#555",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"},children:a.school_phone||"+234-800-000-0000"}),e.jsx("div",{style:{marginTop:"1mm",borderBottom:"2px solid #2c3e50",width:"80%",margin:"1mm auto 0"}})]}),e.jsxs("div",{className:"print-section",style:{marginBottom:"2mm",display:"flex",gap:"1mm",justifyContent:"center",alignItems:"stretch"},children:[e.jsx("div",{style:{width:"75%"},children:e.jsx("table",{style:{width:"100%",borderCollapse:"collapse",border:"2px solid #2c3e50",backgroundColor:"#f8f9fa",height:"18mm",pageBreakInside:"avoid"},children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Name:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:b?`${b.firstName} ${b.lastName}`.toUpperCase():"STUDENT NAME"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Session:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:t.academic_year||"2024/2025"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:s?.name||"CLASS NAME"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:b?.gender||"MALE"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:"Next Term Begins:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},colSpan:5,children:t?.next_term_begin||a?.resumption_date||""})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Admission No:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:b?.admissionNumber||"GRA/XXXXX"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Term:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:t.term||"THIRD TERM"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Attendance:"}),e.jsxs("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:[t.times_present||0," / ",t.total_attendance_days||0," days"]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Class:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:s?.name||"CLASS NAME"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Gender:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},children:b?.gender||"MALE"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontWeight:"bold",fontSize:"7pt"},children:"Next Term Begins:"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt"},colSpan:5,children:t?.next_term_begin||a?.resumption_date||""})]})]})})}),e.jsx("div",{style:{width:"25%"},children:e.jsx("div",{className:"border border-black",style:{height:"18mm",display:"flex",alignItems:"center",justifyContent:"center"},children:b?.photo_url?e.jsx("img",{src:b.photo_url,alt:"Student Photo",style:{width:"100%",height:"100%",objectFit:"cover"}}):e.jsx("div",{style:{width:"100%",height:"100%",backgroundColor:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:"9pt",color:"#666"},children:"No Photo"})})})})]}),e.jsx("div",{style:{textAlign:"center",marginBottom:"1mm",padding:"1mm 0"},children:e.jsxs("h2",{style:{fontSize:"13pt",fontWeight:"bold",textDecoration:"underline",margin:"0.5mm 0",textTransform:"uppercase",color:"#2c3e50",letterSpacing:"2px",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"},children:[t.term||"THIRD TERM"," RESULT SHEET"]})}),e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:"1mm"},children:e.jsxs("table",{className:"print-table",style:{fontSize:"7pt",width:"95%",borderCollapse:"collapse",border:"2px solid #2c3e50",backgroundColor:"white",boxShadow:"0 2px 4px rgba(0,0,0,0.1)",pageBreakInside:"avoid",pageBreakAfter:"auto",textRendering:"geometricPrecision",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#2c3e50",color:"white"},children:[e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"3%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"SN"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"16%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"SUBJECT"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"6%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"1st CA"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"6%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"2nd CA"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"6%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"Exams"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"6%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"Total"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"5%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"Grd"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",width:"8%",fontWeight:"bold",fontSize:"7pt",backgroundColor:"#2c3e50",color:"white"},children:"Remark"})]})}),e.jsx("tbody",{children:H&&H.length>0?H.map((r,i)=>{const n=ae(r.total||0);return e.jsxs("tr",{children:[e.jsx("td",{className:"border border-black text-center",style:{padding:"0.4mm",textAlign:"center",fontSize:"7pt"},children:i+1}),e.jsx("td",{className:"border border-black",style:{padding:"0.4mm",fontSize:"7pt"},children:r.subject_name||"Subject"}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.4mm",textAlign:"center",fontSize:"7pt"},children:r.ca1||0}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.4mm",textAlign:"center",fontSize:"7pt"},children:r.ca2||0}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.4mm",textAlign:"center",fontSize:"7pt"},children:r.exam||0}),e.jsx("td",{className:"border border-black text-center font-bold",style:{padding:"0.4mm",textAlign:"center",fontWeight:"bold",fontSize:"7pt"},children:r.total||0}),e.jsx("td",{className:"border border-black text-center font-bold",style:{padding:"0.4mm",textAlign:"center",fontWeight:"bold",fontSize:"7pt"},children:n.grade}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.4mm",textAlign:"center",fontSize:"4pt"},children:n.remark})]},i)}):e.jsx("tr",{children:e.jsx("td",{colSpan:9,className:"border border-black p-2 text-center text-gray-500",style:{padding:"1.5mm",fontSize:"7pt"},children:"No scores available"})})})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:"1mm"},children:e.jsx("table",{className:"print-table",style:{marginTop:"0.8mm",fontSize:"6pt",width:"95%",borderCollapse:"collapse",border:"2px solid #2c3e50",backgroundColor:"#f8f9fa",boxShadow:"0 2px 4px rgba(0,0,0,0.1)",pageBreakInside:"avoid"},children:e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsxs("td",{className:"border border-black p-1",style:{padding:"0.8mm",width:"25%",fontSize:"7pt"},children:[e.jsx("b",{children:"TOTAL:"})," ",t.total_score||"0.00"]}),e.jsxs("td",{className:"border border-black p-1",style:{padding:"0.8mm",width:"25%",fontSize:"7pt"},children:[e.jsx("b",{children:"AVG:"})," ",t.average_score||"0.00"]}),e.jsxs("td",{className:"border border-black p-1",style:{padding:"0.8mm",width:"25%",fontSize:"7pt"},children:[e.jsx("b",{children:"CLASS AVG:"})," ",t.class_average||"0.00"]}),!s?.name?.toUpperCase().includes("CRECHE")&&!s?.name?.toUpperCase().includes("KG1")&&!s?.name?.toUpperCase().includes("KG2")&&!s?.name?.toUpperCase().includes("KG 1")&&!s?.name?.toUpperCase().includes("KG 2")&&!s?.name?.toUpperCase().includes("KINDERGARTEN")&&e.jsxs("td",{className:"border border-black p-1",style:{padding:"0.8mm",width:"25%",fontSize:"7pt"},children:[e.jsx("b",{children:"POS:"})," ",t.position?`${t.position}${t.position===1?"st":t.position===2?"nd":t.position===3?"rd":"th"}`:"___"]})]})})})}),e.jsxs("div",{style:{display:"flex",justifyContent:"center",marginTop:"2mm",marginBottom:"1.5mm",gap:"2mm"},children:[e.jsxs("div",{className:"border border-black p-1",style:{padding:"2mm",fontSize:"6pt",width:"47%",minHeight:"25mm",border:"2px solid #2c3e50",backgroundColor:"#f8f9fa",boxShadow:"0 2px 4px rgba(0,0,0,0.1)",pageBreakInside:"avoid",overflow:"visible"},children:[e.jsx("p",{style:{margin:"0.3mm 0",fontSize:"7pt",fontWeight:"bold",color:"#2c3e50"},children:"CLASS TEACHER"}),e.jsxs("p",{style:{margin:"0.3mm 0",fontSize:"7pt"},children:[e.jsx("b",{children:"Name:"})," ",oe()]}),e.jsxs("p",{style:{margin:"0.3mm 0",fontSize:"7pt",whiteSpace:"pre-wrap",wordWrap:"break-word",maxWidth:"100%",overflow:"visible",lineHeight:"1.2"},children:[e.jsx("b",{children:"Comment:"})," ",t?.class_teacher_comment||t?.comment||"Teacher comment will appear here."]})]}),e.jsxs("div",{className:"border border-black p-1",style:{padding:"2mm",fontSize:"6pt",width:"47%",minHeight:"30mm",border:"2px solid #2c3e50",backgroundColor:"#f8f9fa",boxShadow:"0 2px 4px rgba(0,0,0,0.1)",pageBreakInside:"avoid",overflow:"visible"},children:[e.jsx("p",{style:{margin:"0.3mm 0",fontSize:"7pt",fontWeight:"bold",color:"#2c3e50"},children:s?.category==="Primary"?"HEAD TEACHER":"PRINCIPAL"}),e.jsxs("p",{style:{margin:"0.3mm 0",fontSize:"7pt"},children:[e.jsx("b",{children:"Name:"}),s?.category==="Primary"?` ${a?.head_teacher_name||"_________________"}`:` ${a?.principal_name||"_________________"}`]}),e.jsxs("p",{style:{margin:"0.3mm 0",fontSize:"7pt",whiteSpace:"pre-wrap",wordWrap:"break-word",maxWidth:"100%",overflow:"visible",lineHeight:"1.2"},children:[e.jsx("b",{children:"Comment:"})," ",s?.category==="Primary"?t?.principal_comment||a?.head_teacher_comment||"Head teacher comment will appear here.":t?.principal_comment||a?.principal_comment||"Principal comment will appear here."]}),e.jsx("div",{style:{marginTop:"1mm",marginBottom:"0.5mm",fontSize:"7pt"},children:e.jsx("b",{children:"Signature:"})}),e.jsx("div",{style:{borderBottom:"1px solid black",height:"8mm",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"},children:s?.category==="Primary"?a?.head_teacher_signature?e.jsx("img",{src:a.head_teacher_signature,alt:"Head Teacher Signature",style:{maxWidth:"100%",maxHeight:"6mm",objectFit:"contain"}}):e.jsx("span",{style:{color:"#999",fontSize:"4pt"}}):a?.principal_signature?e.jsx("img",{src:a.principal_signature,alt:"Principal Signature",style:{maxWidth:"100%",maxHeight:"6mm",objectFit:"contain"}}):e.jsx("span",{style:{color:"#999",fontSize:"4pt"}})})]})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:"2mm",marginBottom:"1mm",alignItems:"flex-start"},children:[e.jsxs("div",{style:{width:"48%"},children:[e.jsx("div",{className:"text-center mb-1",children:e.jsx("h3",{className:"font-bold underline",style:{fontSize:"10pt",marginBottom:"0.5mm",color:"#2c3e50",letterSpacing:"1px"},children:"AFFECTIVE"})}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1px solid black",fontSize:"6pt",boxShadow:"0 1px 2px rgba(0,0,0,0.1)",pageBreakInside:"avoid",tableLayout:"fixed"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#1a252f",color:"white"},children:[e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",fontSize:"6pt",backgroundColor:"#1a252f",color:"white",fontWeight:"bold",width:"50%"},children:"QUALITY"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",fontSize:"6pt",backgroundColor:"#1a252f",color:"white",fontWeight:"bold",width:"20%"},children:"SCORE"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",fontSize:"6pt",backgroundColor:"#1a252f",color:"white",fontWeight:"bold",width:"30%"},children:"REMARK"})]})}),e.jsx("tbody",{children:(()=>{const r=ee();return e.jsxs(e.Fragment,{children:[e.jsxs("tr",{style:{backgroundColor:"#f8f9fa"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("attentiveness")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.attentiveness||t.affective?.attentiveness||"4"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.attentiveness||t.affective?.attentiveness||4))})]}),e.jsxs("tr",{style:{backgroundColor:"white"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("honesty")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.honesty||t.affective?.honesty||"3"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.honesty||t.affective?.honesty||3))})]}),e.jsxs("tr",{style:{backgroundColor:"#f8f9fa"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("neatness")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.neatness||t.affective?.neatness||"4"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.neatness||t.affective?.neatness||4))})]}),e.jsxs("tr",{style:{backgroundColor:"white"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("obedience")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.obedience||t.affective?.obedience||"2"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.obedience||t.affective?.obedience||2))})]}),e.jsxs("tr",{style:{backgroundColor:"#f8f9fa"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("sense_of_responsibility")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.sense_of_responsibility||t.affective?.sense_of_responsibility||"3"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.sense_of_responsibility||t.affective?.sense_of_responsibility||3))})]})]})})()})]})]}),e.jsxs("div",{style:{width:"48%"},children:[e.jsx("div",{className:"text-center mb-1",children:e.jsx("h3",{className:"font-bold underline",style:{fontSize:"10pt",marginBottom:"0.5mm",color:"#2c3e50",letterSpacing:"1px"},children:"PSYCHOMOTOR"})}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",border:"1px solid black",fontSize:"7pt",boxShadow:"0 1px 2px rgba(0,0,0,0.1)",pageBreakInside:"avoid",tableLayout:"fixed"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{backgroundColor:"#1a252f",color:"white"},children:[e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",fontSize:"6pt",backgroundColor:"#1a252f",color:"white",fontWeight:"bold",width:"50%"},children:"SKILL"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",fontSize:"6pt",backgroundColor:"#1a252f",color:"white",fontWeight:"bold",width:"20%"},children:"SCORE"}),e.jsx("th",{className:"border border-black",style:{padding:"0.6mm",fontSize:"6pt",backgroundColor:"#1a252f",color:"white",fontWeight:"bold",width:"30%"},children:"REMARK"})]})}),e.jsx("tbody",{children:(()=>{const r=te();return e.jsxs(e.Fragment,{children:[e.jsxs("tr",{style:{backgroundColor:"#f8f9fa"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("attention_to_direction")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.attention_to_direction||t.psychomotor?.attention_to_direction||"4"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.attention_to_direction||t.psychomotor?.attention_to_direction||4))})]}),e.jsxs("tr",{style:{backgroundColor:"white"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("considerate_of_others")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.considerate_of_others||t.psychomotor?.considerate_of_others||"2"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.considerate_of_others||t.psychomotor?.considerate_of_others||2))})]}),e.jsxs("tr",{style:{backgroundColor:"#f8f9fa"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("handwriting")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.handwriting||t.psychomotor?.handwriting||"4"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.handwriting||t.psychomotor?.handwriting||4))})]}),e.jsxs("tr",{style:{backgroundColor:"white"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("sports")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.sports||t.psychomotor?.sports||"3"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.sports||t.psychomotor?.sports||3))})]}),e.jsxs("tr",{style:{backgroundColor:"#f8f9fa"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("verbal_fluency")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.verbal_fluency||t.psychomotor?.verbal_fluency||"4"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.verbal_fluency||t.psychomotor?.verbal_fluency||4))})]}),e.jsxs("tr",{style:{backgroundColor:"white"},children:[e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"600",color:"#000000",textRendering:"geometricPrecision"},children:m("works_well_independently")}),e.jsx("td",{className:"border border-black text-center",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"bold",color:"#000000",textRendering:"geometricPrecision"},children:r.works_well_independently||t.psychomotor?.independent_work||"5"}),e.jsx("td",{className:"border border-black",style:{padding:"0.5mm",fontSize:"7pt",fontWeight:"500",color:"#000000",textRendering:"geometricPrecision"},children:l(parseInt(r.works_well_independently||t.psychomotor?.independent_work||5))})]})]})})()})]})]})]})]})}),w&&e.jsxs("div",{className:"no-print",style:{textAlign:"center",marginTop:"20px",marginBottom:"20px",padding:"10px"},children:[e.jsx(R,{onClick:Q,className:"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded",style:{marginRight:"8px"},children:"Print Result (Ctrl+P)"}),j&&e.jsx(R,{onClick:()=>j(t.id),className:"bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded",children:"Download PDF"})]})]})}function je({studentId:W,resultId:P,onClose:t}){const{students:x,classes:w,compiledResults:j}=V(),[N,$]=h.useState(null),[u,a]=h.useState(null),[v,F]=h.useState(null);h.useEffect(()=>{const g=Array.isArray(x)?x:[],z=Array.isArray(j)?j:[],C=Array.isArray(w)?w:[],A=g.find(y=>y.id===W),S=z.find(y=>y.id===P),M=C.find(y=>y.id===S?.class_id);$(A),a(S),F(M)},[W,P,x,j,w]);const T=()=>{window.print()},E=()=>{const g=document.querySelector("[data-download-pdf]");g&&g.click()};return!N||!u?e.jsx("div",{className:"min-h-screen bg-gray-100 flex items-center justify-center",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"}),e.jsx("p",{className:"text-gray-600",children:"Loading result..."})]})}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @media screen {
          body {
            margin: 0;
            padding: 0;
            overflow-x: auto;
            background: #f3f4f6;
          }
          
          .full-page-container {
            background: #f3f4f6;
            min-height: 100vh;
            padding: 2rem 0;
          }
          
          .no-print {
            display: block !important;
          }
          
          .print-only {
            display: none !important;
          }
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            overflow: visible !important;
          }
          
          .full-page-container {
            background: white !important;
            padding: 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .full-page-container {
            background: white !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .bg-white.shadow-2xl.mx-auto {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}),e.jsxs("div",{className:"min-h-screen bg-gray-100",children:[e.jsx("div",{className:"no-print bg-white shadow-md border-b border-gray-200 sticky top-0 z-50",children:e.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:e.jsxs("div",{className:"flex justify-between items-center py-4",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs(R,{variant:"outline",onClick:t,className:"flex items-center gap-2",children:[e.jsx(ce,{className:"w-4 h-4"}),"Back to Results"]}),e.jsxs("div",{children:[e.jsxs("h1",{className:"text-xl font-semibold text-gray-900",children:[N.firstName," ",N.lastName," - Result Sheet"]}),e.jsxs("p",{className:"text-sm text-gray-600",children:[v?.name," • ",u.term," • ",u.academic_year]})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs(R,{variant:"outline",onClick:T,className:"flex items-center gap-2",children:[e.jsx(le,{className:"w-4 h-4"}),"Print"]}),e.jsxs(R,{variant:"outline",onClick:E,className:"flex items-center gap-2","data-download-pdf":!0,children:[e.jsx(me,{className:"w-4 h-4"}),"Download PDF"]})]})]})})}),e.jsx("div",{className:"full-page-container py-8",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsx("div",{className:"bg-white shadow-2xl mx-auto overflow-auto",style:{width:"210mm",minHeight:"297mm",maxWidth:"100%",aspectRatio:"210/297",overflow:"visible"},children:e.jsx("div",{className:"transform-gpu",style:{transform:"scale(1)",transformOrigin:"top center",width:"100%",height:"100%",overflow:"visible"},children:e.jsx(he,{student:N,studentClass:v,result:u,showActions:!1,currentUser:{role:"admin"}})})}),e.jsxs("div",{className:"no-print mt-8 text-center text-gray-600",children:[e.jsx("p",{className:"text-sm",children:"This is displayed in A4 format. Use the Print button to print or Download PDF to save."}),e.jsx("p",{className:"text-xs mt-2",children:"The result sheet is optimized for A4 paper size (210mm × 297mm)."})]})]})})]})]})}export{je as F,he as S};
