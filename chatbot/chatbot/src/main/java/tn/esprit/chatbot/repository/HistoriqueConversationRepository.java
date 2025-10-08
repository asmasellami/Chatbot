package tn.esprit.chatbot.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.chatbot.models.HistoriqueConversation;
import java.util.List;

@Repository
public interface HistoriqueConversationRepository extends JpaRepository<HistoriqueConversation, Long> {
    List<HistoriqueConversation> findTop1ByOrderByDateDesc(Pageable pageable);
    List<HistoriqueConversation> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}