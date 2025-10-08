package tn.esprit.chatbot.models;


import lombok.Data;

@Data
public class QuestionRequest {
    private String question;
    private Long user_id;
}
