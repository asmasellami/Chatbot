package tn.esprit.chatbot.models;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistationRequest {
    private String username;
    private String password;
    private String email;
}