package tn.esprit.chatbot.models;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Intent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tag;
    private Long fileId;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "intent_patterns")
    private List<String> patterns;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "intent_responses")
    private List<String> responses;


}