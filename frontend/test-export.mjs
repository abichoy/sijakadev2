import { jsPDF } from 'jspdf';
const doc = new jsPDF();
doc.text("Test", 14, 22);
console.log("Success jsPDF creation");
