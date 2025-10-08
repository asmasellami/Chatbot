package tn.esprit.chatbot.models;
import jakarta.persistence.*;
import jakarta.persistence.Entity;
import lombok.Data;
import java.util.Date;

@Entity
@Data
public class IntentFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    @Temporal(TemporalType.TIMESTAMP)
    private Date date;
}
