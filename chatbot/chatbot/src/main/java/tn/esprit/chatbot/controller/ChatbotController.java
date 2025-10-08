package tn.esprit.chatbot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.chatbot.models.HistoriqueConversation;
import tn.esprit.chatbot.models.Intent;
import tn.esprit.chatbot.models.IntentFile;
import tn.esprit.chatbot.models.QuestionRequest;
import tn.esprit.chatbot.service.FileSearchService;
import tn.esprit.chatbot.service.IntentService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class ChatbotController {

    @Autowired
    private IntentService intentService;
    @Autowired
    private FileSearchService fileSearchService;

    @PostMapping("/import-intents")
    public ResponseEntity<Map<String, String>> importIntents(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            intentService.importIntents(file);
            response.put("message","Import successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Error while importing : " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update-file/{fileId}")
    public ResponseEntity<String> updateIntentFile(@PathVariable Long fileId, @RequestParam("file") MultipartFile file) {
        try {
            intentService.updateIntentFile(fileId, file);
            return ResponseEntity.ok("File updated Successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error : " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-file/{fileId}")
    public ResponseEntity<Map<String, String>> deleteIntentFile(@PathVariable Long fileId) {
        try {
            intentService.deleteIntentFile(fileId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "File deleted Successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error : " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/files")
    public ResponseEntity<List<IntentFile>> getAllFiles() {
        try {
            List<IntentFile> files = intentService.getAllFiles();
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/file-content/{fileId}")
    public ResponseEntity<String> getFileContent(@PathVariable Long fileId) {
        try {
            String content = intentService.getFileContent(fileId);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving content : " + e.getMessage());
        }
    }

    @PostMapping("/ask")
    public ResponseEntity<String> askQuestion(@RequestBody QuestionRequest request) {
        try {
            String response = intentService.processQuestion(request.getQuestion(), request.getUser_id());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("error while processing the question : " + e.getMessage());
        }
    }

    @PostMapping("/search-files")
    public ResponseEntity<?> searchFiles(@RequestBody Map<String, String> request) {
        String keyword = request.get("keyword");
        if (keyword == null || keyword.isEmpty()) {
            return ResponseEntity.badRequest().body("Please provide a keyword.");
        }
        try {
            List<String> files = fileSearchService.searchFilesByKeyword(keyword);
            return ResponseEntity.ok(files);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while searching files : " + e.getMessage());
        }
    }

    @GetMapping("/download-file")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) throws IOException {
        Path file = Paths.get(path);
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);

        return ResponseEntity.ok()
                .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/historique")
    public ResponseEntity<List<HistoriqueConversation>> viewAllHistorique() {
        try {
            List<HistoriqueConversation> historique = intentService.getAllhistory();
            return ResponseEntity.ok(historique);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/historique")
    public ResponseEntity<String> deleteAllHistory() {
        try {
            intentService.deleteAllHistory();
            return ResponseEntity.ok("All history deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error while deleting: " + e.getMessage());
        }
    }

    @GetMapping("/historique/{userId}")
    public ResponseEntity<List<HistoriqueConversation>> getUserHistory(@PathVariable Long userId) {
        try {
            List<HistoriqueConversation> historique = intentService.findByUserId(userId);
            return ResponseEntity.ok(historique);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/historique/{userId}")
    public ResponseEntity<String> deleteUserHistory(@PathVariable Long userId) {
        try {
            intentService.deleteByUserId(userId);
            return ResponseEntity.ok("History deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error : " + e.getMessage());
        }
    }

    @DeleteMapping("/historique/{userId}/{date}")
    public ResponseEntity<String> deleteUserHistoryByDate(@PathVariable Long userId, @PathVariable String date) {
        try {
            intentService.deleteHistoryByUserAndDate(userId, date);
            return ResponseEntity.ok("History of " + date + " deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error : " + e.getMessage());
        }
    }

    @GetMapping("/intents")
    public ResponseEntity<List<Intent>> viewAllIntents() {
        try {
            List<Intent> intents = intentService.getAllIntents();
            return ResponseEntity.ok(intents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/intents/{id}")
    public ResponseEntity<Intent> viewIntentById(@PathVariable Long id) {
        try {
            Intent intent = intentService.getIntentById(id);
            if (intent != null) {
                return ResponseEntity.ok(intent);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/intents/{id}")
    public ResponseEntity<String> updateIntent(@PathVariable Long id, @RequestBody Intent updatedIntent) {
        try {
            intentService.updateIntent(id, updatedIntent);
            return ResponseEntity.ok("Intent updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error while updating : " + e.getMessage());
        }
    }

    @PutMapping("/intents")
    public ResponseEntity<String> updateAllIntents(@RequestParam("file") MultipartFile file) {
        try {
            intentService.updateAllIntents(file);
            return ResponseEntity.ok("All intents updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error while updating intents : " + e.getMessage());
        }
    }


    @DeleteMapping("/intents")
    public ResponseEntity<String> deleteAllIntents() {
        try {
            intentService.deleteAllIntents();
            return ResponseEntity.ok("All intents deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error while deleting the intents: " + e.getMessage());
        }
    }

    @DeleteMapping("/intents/{id}")
    public ResponseEntity<String> deleteIntent(@PathVariable Long id) {
        try {
            intentService.deleteIntent(id);
            return ResponseEntity.ok("Intent deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error while deleting" + e.getMessage());
        }
    }

}

