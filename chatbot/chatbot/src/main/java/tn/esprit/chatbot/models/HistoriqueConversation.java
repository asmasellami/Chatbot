package tn.esprit.chatbot.models;
import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
public class HistoriqueConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id")
    private Long userId;
    private Long intentId;
    private String pattern;
    private String reponse;
    @Temporal(TemporalType.TIMESTAMP)
    private Date date;
}