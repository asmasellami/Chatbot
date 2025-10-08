package tn.esprit.chatbot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.chatbot.models.IntentFile;


@Repository
public interface IntentFileRepository extends JpaRepository<IntentFile, Long> {

}