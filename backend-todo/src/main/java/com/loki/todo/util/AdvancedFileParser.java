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
import java.util.*;
import java.util.regex.Pattern;

@Slf4j
@Component
public class AdvancedFileParser {

    public String extractText(MultipartFile file) throws Exception {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("File name is null");
        }

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        log.info("Extracting text from {} file: {}", extension, fileName);

        switch (extension) {
            case "pdf":
                return extractFromPDF(file);
            case "docx":
                return extractFromDocx(file);
            case "doc":
                return extractFromDoc(file);
            case "txt":
            case "md":
                return extractFromText(file);
            case "jpg":
            case "jpeg":
            case "png":
                return extractFromImage(file);
            default:
                throw new IllegalArgumentException("Unsupported file type: " + extension);
        }
    }

    public String getFileType(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return "unknown";
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    public Map<String, Object> analyzeDocument(String text, String fileType) {
        Map<String, Object> analysis = new HashMap<>();

        // Basic statistics
        analysis.put("characterCount", text.length());
        analysis.put("wordCount", countWords(text));
        analysis.put("lineCount", text.split("\n").length);
        analysis.put("paragraphCount", text.split("\n\n").length);

        // Structure analysis
        analysis.put("hasHeadings", detectHeadings(text));
        analysis.put("hasBulletPoints", detectBulletPoints(text));
        analysis.put("hasNumberedLists", detectNumberedLists(text));
        analysis.put("hasTables", detectTables(text));

        // Content analysis
        analysis.put("estimatedReadingTimeMinutes", estimateReadingTime(text));
        analysis.put("complexity", assessComplexity(text));
        analysis.put("topics", extractTopics(text));

        // Date patterns
        analysis.put("hasDates", detectDates(text));

        return analysis;
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
        // For older .doc files, treat as text for now
        return extractFromText(file);
    }

    private String extractFromText(MultipartFile file) throws Exception {
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

    private String extractFromImage(MultipartFile file) throws Exception {
        // Placeholder for OCR functionality
        // You can integrate Tesseract or other OCR here
        log.warn("OCR not implemented for images");
        return "[Image content could not be extracted. Please provide text-based documents for better parsing.]";
    }

    private int countWords(String text) {
        if (text == null || text.isEmpty()) return 0;
        return text.split("\\s+").length;
    }

    private boolean detectHeadings(String text) {
        Pattern headingPattern = Pattern.compile("(?m)^[A-Z][A-Z\\s]+$|^#{1,6}\\s.+$");
        return headingPattern.matcher(text).find();
    }

    private boolean detectBulletPoints(String text) {
        Pattern bulletPattern = Pattern.compile("(?m)^\\s*[•\\-\\*]\\s");
        return bulletPattern.matcher(text).find();
    }

    private boolean detectNumberedLists(String text) {
        Pattern numberedPattern = Pattern.compile("(?m)^\\s*\\d+\\.\\s");
        return numberedPattern.matcher(text).find();
    }

    private boolean detectTables(String text) {
        Pattern tablePattern = Pattern.compile("\\|\\s*[-\\w]+\\s*\\|");
        return tablePattern.matcher(text).find();
    }

    private boolean detectDates(String text) {
        Pattern datePattern = Pattern.compile("\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|day\\s+\\d+|week\\s+\\d+");
        return datePattern.matcher(text.toLowerCase()).find();
    }

    private int estimateReadingTime(String text) {
        int wordsPerMinute = 200;
        int wordCount = countWords(text);
        return Math.max(1, wordCount / wordsPerMinute);
    }

    private String assessComplexity(String text) {
        int wordCount = countWords(text);
        double avgWordLength = wordCount > 0 ?
                (double) text.length() / wordCount : 0;

        if (avgWordLength < 4) return "SIMPLE";
        if (avgWordLength < 6) return "MODERATE";
        return "COMPLEX";
    }

    private List<String> extractTopics(String text) {
        List<String> topics = new ArrayList<>();

        // Common topic indicators
        String[] lines = text.split("\n");
        for (String line : lines) {
            line = line.trim();
            // Look for headings or emphasized text
            if (line.matches("^[A-Z][A-Z\\s]+$") ||
                    line.startsWith("#") ||
                    line.matches("^\\d+\\.\\s+.+")) {
                topics.add(line.replaceAll("^#+\\s*", ""));
            }
        }

        return topics.subList(0, Math.min(10, topics.size()));
    }
}