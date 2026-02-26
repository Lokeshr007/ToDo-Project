// BACKEND-TODO/SRC/main/java/com/loki/todo/util/FileTextExtractor.java
package com.loki.todo.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Component
public class FileTextExtractor {

    public String extractText(MultipartFile file) throws Exception {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("File name is null");
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        switch (extension) {
            case "pdf":
                return extractFromPDF(file);
            case "docx":
                return extractFromDocx(file);
            case "doc":
                return extractFromDoc(file);
            case "txt":
                return extractFromTxt(file);
            default:
                throw new IllegalArgumentException("Unsupported file type: " + extension);
        }
    }

    private String extractFromPDF(MultipartFile file) throws Exception {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractFromDocx(MultipartFile file) throws Exception {
        try (XWPFDocument docx = new XWPFDocument(file.getInputStream())) {
            XWPFWordExtractor extractor = new XWPFWordExtractor(docx);
            return extractor.getText();
        }
    }

    private String extractFromDoc(MultipartFile file) throws Exception {
        // For older .doc files, you might need Apache POI's HWPF
        // For simplicity, treat as text
        return extractFromTxt(file);
    }

    private String extractFromTxt(MultipartFile file) throws Exception {
        StringBuilder text = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                text.append(line).append("\n");
            }
        }
        return text.toString();
    }
}
