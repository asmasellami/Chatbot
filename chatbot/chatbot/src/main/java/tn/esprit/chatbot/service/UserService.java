package tn.esprit.chatbot.service;


import tn.esprit.chatbot.models.RegistationRequest;
import tn.esprit.chatbot.models.Role;
import tn.esprit.chatbot.models.User;

import java.util.List;


public interface UserService {
    User saveUser(User user);
    User findUserByUsername (String username);
    Role addRole(Role role);
    User addRoleToUser(String username, String rolename);
    List<User> findAllUsers();
    User registerUser(RegistationRequest request);
    void deleteUser(Long userId);
    User updateUser(User user);
    User AddUser(RegistationRequest request);
    User getUserById(Long userId);
    User getUser(Long userId);
    List<String> getAllRoleNames();

}
