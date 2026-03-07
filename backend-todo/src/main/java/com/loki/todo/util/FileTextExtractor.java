// BACKEND-TODO/SRC/main/java/com/loki/todo/util/FileTextExtractor.java
package com.loki.todo.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Slf4j
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
        byte[] bytes = file.getBytes();
        if (bytes.length == 0) {
            throw new RuntimeException("The uploaded PDF file is empty.");
        }
        
        try (PDDocument document = PDDocument.load(bytes)) {
            if (document.isEncrypted()) {
                log.warn("PDF file is encrypted, attempting to decrypt");
                try {
                    document.setAllSecurityToBeRemoved(true);
                } catch (Exception e) {
                    throw new RuntimeException("This PDF is password protected.");
                }
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            
            if (text == null || text.trim().isEmpty()) {
                return "[PDF content could not be extracted (likely scanned/image-based).]";
            }
            return text;
        } catch (Exception e) {
            throw new RuntimeException("Failed to read PDF: " + e.getMessage());
        }
    }

    private String extractFromDocx(MultipartFile file) throws Exception {
        try (XWPFDocument docx = new XWPFDocument(file.getInputStream())) {
            XWPFWordExtractor extractor = new XWPFWordExtractor(docx);
            return extractor.getText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to read DOCX: " + e.getMessage());
        }
    }

    private String extractFromDoc(MultipartFile file) throws Exception {
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
