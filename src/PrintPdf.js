import html2canvas from "html2canvas";
import JsPdf from "jspdf";

// documentID와 파일명을 매개변수로 받습니다.
async function PrintPDF(id, name) {
  html2canvas(document.getElementById(id), {
    onclone: (document) => {
      document.getElementById("print").style.visibility = "hidden";
    },
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new JsPdf("p", "mm");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;
      var position = 0;
      var pageHeight = 295;
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 페이지가 넘칠 경우 다음 페이지를 생성합니다.
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${name}.pdf`);
    })
    .catch((error) => console.log(error));
}

export default PrintPDF;
