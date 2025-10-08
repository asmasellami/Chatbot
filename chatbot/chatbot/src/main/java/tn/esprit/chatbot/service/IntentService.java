package tn.esprit.chatbot.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.chatbot.models.HistoriqueConversation;
import tn.esprit.chatbot.repository.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import org.json.JSONArray;
import org.json.JSONObject;
import tn.esprit.chatbot.models.Intent;
import tn.esprit.chatbot.models.IntentFile;
import java.nio.charset.StandardCharsets;

@Service
public class IntentService {

    @Autowired
    private IntentRepository intentRepository;
    @Autowired
    private HistoriqueConversationRepository historiqueRepository;
    @Autowired
    private IntentFileRepository intentFileRepository;
    @Autowired
    private FileSearchService fileSearchService;

    @Transactional
    public void importIntents(MultipartFile file) throws IOException {
        IntentFile intentFile = new IntentFile();
        intentFile.setFileName(file.getOriginalFilename());
        intentFile.setDate(new Date());
        intentFile = intentFileRepository.save(intentFile);
        ObjectMapper mapper = new ObjectMapper();
        List<Intent> intents = Arrays.asList(mapper.readValue(file.getInputStream(), Intent[].class));
        for (Intent intent : intents) {
            intent.setFileId(intentFile.getId());
            intentRepository.save(intent);
        }
        envoyerPatternsAuFlask(intentRepository.findAll());
    }

    @Transactional
    public void updateIntentFile(Long fileId, MultipartFile newFile) throws IOException {
        intentRepository.deleteByFileId(fileId);
        ObjectMapper mapper = new ObjectMapper();
        List<Intent> newIntents = Arrays.asList(mapper.readValue(newFile.getInputStream(), Intent[].class));
        for (Intent intent : newIntents) {
            intent.setFileId(fileId);
            intentRepository.save(intent);
        }
        Optional<IntentFile> optionalFile = intentFileRepository.findById(fileId);
        if (optionalFile.isPresent()) {
            IntentFile intentFile = optionalFile.get();
            intentFile.setFileName(newFile.getOriginalFilename());
            intentFile.setDate(new Date());
            intentFileRepository.save(intentFile);
        }
        envoyerPatternsAuFlask(intentRepository.findAll());
    }

    @Transactional
    public void deleteIntentFile(Long fileId) {
        intentRepository.deleteByFileId(fileId);
        intentFileRepository.deleteById(fileId);
    }

    public List<IntentFile> getAllFiles() {
        return intentFileRepository.findAll();
    }

    public String getFileContent(Long fileId) throws IOException {
        List<Intent> intents = intentRepository.findByFileId(fileId);
        if (intents.isEmpty()) {
            throw new IOException("No intent found for file with ID" + fileId);
        }
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(intents);
    }

    public List<HistoriqueConversation> getAllhistory() {
        return historiqueRepository.findAll();
    }

    @Transactional
    public void deleteAllHistory() {
        historiqueRepository.deleteAll();
    }

    @Transactional
    public void deleteHistoryByUserAndDate(Long userId, String date) {
        LocalDate targetDate = LocalDate.parse(date);
        List<HistoriqueConversation> toDelete = historiqueRepository.findByUserId(userId)
                .stream()
                .filter(h -> h.getDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().equals(targetDate))
                .toList();
        historiqueRepository.deleteAll(toDelete);
    }

    public List<HistoriqueConversation> findByUserId(Long userId) {
        return historiqueRepository.findByUserId(userId);
    }

    public void deleteByUserId(Long userId) {
        historiqueRepository.deleteByUserId(userId);
    }

    @Transactional
    public void updateAllIntents(MultipartFile file) throws IOException {
        intentRepository.deleteAll();
        ObjectMapper mapper = new ObjectMapper();
        Intent[] intentsArray = mapper.readValue(file.getInputStream(), Intent[].class);
        List<Intent> intents = Arrays.asList(intentsArray);
        for (Intent intent : intents) {
            intentRepository.save(intent);
        }
        envoyerPatternsAuFlask(intentRepository.findAll());
    }

    public List<Intent> getAllIntents() {
        return intentRepository.findAll();
    }

    public Intent getIntentById(Long id) {
        Optional<Intent> intent = intentRepository.findById(id);
        return intent.orElse(null);
    }

    @Transactional
    public void updateIntent(Long id, Intent updatedIntent) {
        Optional<Intent> existingIntent = intentRepository.findById(id);
        if (existingIntent.isPresent()) {
            Intent intent = existingIntent.get();
            intent.setTag(updatedIntent.getTag() != null ? updatedIntent.getTag() : intent.getTag());
            intent.setPatterns(updatedIntent.getPatterns() != null ? updatedIntent.getPatterns() : intent.getPatterns());
            intent.setResponses(updatedIntent.getResponses() != null ? updatedIntent.getResponses() : intent.getResponses());
            intentRepository.save(intent);
            envoyerPatternsAuFlask(intentRepository.findAll());

        } else {
            throw new IllegalArgumentException("Intent with ID " + id + " not found");
        }
    }

    @Transactional
    public void deleteIntent(Long id) {
        if (intentRepository.existsById(id)) {
            intentRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Intent with ID " + id + " not found");
        }
    }

    @Transactional
    public void deleteAllIntents() {
        intentRepository.deleteAll();
    }

    @Transactional
    public String processQuestion(String question, Long utilisateurId) {
        List<HistoriqueConversation> recentHistory = historiqueRepository.findTop1ByOrderByDateDesc(
                PageRequest.of(0, 1));
        Long previousIntentId = recentHistory.isEmpty() ? null : recentHistory.get(0).getIntentId();
        String previousTag = null;
        if (previousIntentId != null) {
            Optional<Intent> previousIntentOpt = intentRepository.findById(previousIntentId);
            if (previousIntentOpt.isPresent()) {
                previousTag = previousIntentOpt.get().getTag();
            }
        }
        Long intentId = trouverIntentParFlask(question);
        if (previousTag != null && intentId != null) {
            Optional<Intent> intentOpt = intentRepository.findById(intentId);
            if (intentOpt.isPresent()) {
                String currentTag = intentOpt.get().getTag();
                String followUpTag = previousTag + "_followup";
                Optional<Intent> followUpIntent = intentRepository.findByTag(followUpTag);
                if (followUpIntent.isPresent() && !followUpTag.equals(currentTag)) {
                    for (String pattern : followUpIntent.get().getPatterns()) {
                        if (question.toLowerCase().contains(pattern.toLowerCase())) {
                            intentId = followUpIntent.get().getId();
                            break;
                        }
                    }
                }
            }
        }
        if (intentId != null) {
            Optional<Intent> intentOpt = intentRepository.findById(intentId);
            if (intentOpt.isPresent()) {
                Intent intent = intentOpt.get();
                if ("search_files".equals(intent.getTag())) {
                    try {
                        String keyword = fileSearchService.extractKeywordFromQuestion(question);
                        List<String> files = fileSearchService.searchFilesByKeyword(keyword);
                        StringBuilder response = new StringBuilder();
                        if (files.isEmpty()) {
                            response.append("Aucun fichier trouvé : ").append(keyword);
                        } else {
                            response.append("Voici les fichiers trouvés:<br>");
                            for (String filePath : files) {
                                String fileName = filePath.substring(filePath.lastIndexOf("\\") + 1);
                                // Use HTTP URL for the download endpoint
                                String fileUrl = "http://localhost:8081/chatbot/api/download-file?path=" + URLEncoder.encode(filePath, StandardCharsets.UTF_8.toString());
                                response.append("<a href='").append(fileUrl).append("' target='_blank'>")
                                        .append(fileName).append("</a><br>");
                            }
                        }
                        saveToHistorique(utilisateurId, intent.getId(), question, response.toString());
                        return response.toString();
                    } catch (IOException e) {
                        e.printStackTrace();
                        String response = "Erreur lors de la recherche.";
                        saveToHistorique(utilisateurId, intent.getId(), question, response);
                        return response;
                    }
                }
                String response = choisirMeilleureReponse(question, intent.getResponses());
                saveToHistorique(utilisateurId, intentId, question, response);
                return response;
            }
        }
        String defaultResponse = "Désolé, je n’ai pas compris votre question. Pouvez-vous reformuler ?";
        saveToHistorique(utilisateurId, null, question, defaultResponse);
        return defaultResponse;
    }

    private void saveToHistorique(Long utilisateurId, Long intentId, String pattern, String response) {
        HistoriqueConversation historique = new HistoriqueConversation();
        historique.setUserId(utilisateurId);
        historique.setIntentId(intentId);
        historique.setPattern(pattern);
        historique.setReponse(response);
        historique.setDate(new Date());
        historiqueRepository.save(historique);
    }

    public void envoyerPatternsAuFlask(List<Intent> intents) {
        try {
            JSONArray payload = new JSONArray();
            for (Intent intent : intents) {
                JSONObject obj = new JSONObject();
                obj.put("intent_id", intent.getId());
                obj.put("tag", intent.getTag());
                JSONArray patternsArray = new JSONArray();
                for (String pattern : intent.getPatterns()) {
                    patternsArray.put(pattern);
                }
                obj.put("patterns", patternsArray);
                JSONArray responsesArray = new JSONArray();
                for (String response : intent.getResponses()) {
                    responsesArray.put(response);
                }
                obj.put("responses", responsesArray);
                payload.put(obj);
            }
            URL url = new URL("http://localhost:5002/set-patterns");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            OutputStream os = conn.getOutputStream();
            os.write(payload.toString().getBytes());
            os.flush();
            conn.getInputStream();
            conn.disconnect();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Long trouverIntentParFlask(String question) {
        try {
            URL url = new URL("http://localhost:5002/match");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            JSONObject input = new JSONObject();
            input.put("text", question);
            OutputStream os = conn.getOutputStream();
            os.write(input.toString().getBytes());
            os.flush();
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String response = br.lines().collect(Collectors.joining());
            conn.disconnect();
            JSONObject res = new JSONObject(response);
            if (res.has("matched_intent_id") && !res.isNull("matched_intent_id")) {
                return res.getLong("matched_intent_id");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @PostConstruct
    public void reenvoyerPatternsAuDemarrage() {
        List<Intent> intents = intentRepository.findAll();
        envoyerPatternsAuFlask(intents);
    }

    private String choisirMeilleureReponse(String question, List<String> responses) {
        try {
            URL url = new URL("http://localhost:5002/compute-embedding");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            JSONObject input = new JSONObject();
            input.put("text", question);
            input.put("responses", responses);
            OutputStream os = conn.getOutputStream();
            os.write(input.toString().getBytes());
            os.flush();
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String responseStr = br.lines().collect(Collectors.joining());
            conn.disconnect();
            JSONObject result = new JSONObject(responseStr);
            return result.getString("best_response");

        } catch (Exception e) {
            e.printStackTrace();
        }

        return responses.get(0);
    }
}
