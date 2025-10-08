package tn.esprit.chatbot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.chatbot.models.Intent;
import java.util.List;
import java.util.Optional;


@Repository
public interface IntentRepository extends JpaRepository<Intent, Long> {
    void deleteByFileId(Long fileId);
    List<Intent> findByFileId(Long fileId);
    Optional<Intent> findByTag(String tag);
}