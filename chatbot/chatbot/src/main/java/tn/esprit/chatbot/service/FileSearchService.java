package tn.esprit.chatbot.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.springframework.stereotype.Service;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileSearchService {

    private final Path docsPath = Paths.get("C:/OneTechDocs");

    public List<String> searchFilesByKeyword(String keyword) throws IOException {
        if (!Files.exists(docsPath)) {
            throw new IOException("The documents folder does not exist.");
        }
        List<String> matchingFiles = new ArrayList<>();
        Files.walk(docsPath)
                .filter(Files::isRegularFile)
                .forEach(path -> {
                    String fileName = path.getFileName().toString().toLowerCase();
                    if (fileName.contains(keyword.toLowerCase())) {
                        matchingFiles.add(path.toString());
                    } else {
                        try {
                            if (fileName.endsWith(".txt")) {
                                String content = Files.readString(path);
                                if (content.toLowerCase().contains(keyword.toLowerCase())) {
                                    matchingFiles.add(path.toString());
                                }
                            } else if (fileName.endsWith(".pdf")) {
                                PDDocument doc = PDDocument.load(path.toFile());
                                PDFTextStripper stripper = new PDFTextStripper();
                                String text = stripper.getText(doc);
                                if (text.toLowerCase().contains(keyword.toLowerCase())) {
                                    matchingFiles.add(path.toString());
                                }
                                doc.close();
                            } else if (fileName.endsWith(".docx")) {
                                FileInputStream fis = new FileInputStream(path.toFile());
                                XWPFDocument docx = new XWPFDocument(fis);
                                XWPFWordExtractor extractor = new XWPFWordExtractor(docx);
                                String text = extractor.getText();
                                if (text.toLowerCase().contains(keyword.toLowerCase())) {
                                    matchingFiles.add(path.toString());
                                }
                                extractor.close();
                                docx.close();
                                fis.close();
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });
        return matchingFiles;
    }

    public String extractKeywordFromQuestion(String question) {
        String[] words = question.split(" ");
        return words[words.length - 1];
    }
}
