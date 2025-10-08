package tn.esprit.chatbot.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.chatbot.service.*;
import tn.esprit.chatbot.models.RegistationRequest;
import tn.esprit.chatbot.models.User;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    UserService userService;

    @GetMapping("/all")
    public List<User> getAllUsers() {

        return userService.findAllUsers();
    }

    @PostMapping("/register")
    public User register(@RequestBody RegistationRequest request) {

        return userService.registerUser(request);
    }

    @DeleteMapping("/delUser/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
    }

    @PutMapping("/updateUser")
    public ResponseEntity<User> updateUser(@RequestBody User user) {
        try {
            return ResponseEntity.ok(userService.updateUser(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/addUser")
    public User addUser(@RequestBody RegistationRequest request) {

        return userService.AddUser(request);
    }

    @GetMapping("/getbyid/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getAllRoles() {
        List<String> roles = userService.getAllRoleNames();
        return ResponseEntity.ok(roles);
    }
}