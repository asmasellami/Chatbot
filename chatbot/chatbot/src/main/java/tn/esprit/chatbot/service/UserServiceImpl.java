package tn.esprit.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.chatbot.exceptions.EmailAlreadyExistsException;
import tn.esprit.chatbot.repository.*;
import tn.esprit.chatbot.models.RegistationRequest;
import tn.esprit.chatbot.models.Role;
import tn.esprit.chatbot.models.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Transactional
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    UserRepository userRep;
    @Autowired
    RoleRepository roleRep;
    @Autowired
    BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public User saveUser(User user) {

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        return userRep.save(user);
    }

    @Override
    public User addRoleToUser(String username, String rolename) {
        User usr = userRep.findByUsername(username);
        Role r = roleRep.findByRole(rolename);

        usr.getRoles().add(r);
        return usr;
    }

    @Override
    public Role addRole(Role role) {

        return roleRep.save(role);
    }

    @Override
    public User findUserByUsername(String username) {

        return userRep.findByUsername(username);
    }

    @Override
    public List<User> findAllUsers() {

        return userRep.findAll();
    }

    @Override
    public User registerUser(RegistationRequest request) {
        Optional<User> optionaluser = userRep.findByEmail(request.getEmail());
        if (optionaluser.isPresent())
            throw new EmailAlreadyExistsException("email already exists");
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(bCryptPasswordEncoder.encode(request.getPassword()));
        newUser.setEnabled(false);
        userRep.save(newUser);
        Role r = roleRep.findByRole("USER");
        List<Role> roles = new ArrayList<>();
        roles.add(r);
        newUser.setRoles(roles);
        return userRep.save(newUser);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = getUser(userId);
        List<Role> roles = user.getRoles();
        for (Role role : roles) {
            role.getUsers().remove(user);
        }
        user.getRoles().clear();
        userRep.deleteById(userId);
    }

    @Override
    public User updateUser(User user) {
        User existingUser = userRep.findById(user.getUser_id())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + user.getUser_id()));
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setEnabled(user.getEnabled());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        }
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            List<Role> updatedRoles = new ArrayList<>();
            for (Role role : user.getRoles()) {
                Role dbRole = roleRep.findByRole(role.getRole());
                if (dbRole == null) {
                    throw new IllegalArgumentException("Role not found: " + role.getRole());
                }
                updatedRoles.add(dbRole);
            }
            existingUser.setRoles(updatedRoles);
        }
        return userRep.save(existingUser);
    }

    @Override
    public User AddUser(RegistationRequest request) {
        System.out.println("Adding user: " + request.getEmail());
        Optional<User> optionalUser = userRep.findByEmail(request.getEmail());
        if (optionalUser.isPresent()) {
            System.out.println("Email already exists: " + request.getEmail());
            throw new EmailAlreadyExistsException("email déjà existant!");
        }
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(bCryptPasswordEncoder.encode(request.getPassword()));
        newUser.setEnabled(true);
        newUser = userRep.save(newUser);
        Role role = roleRep.findByRole("USER");
        List<Role> roles = new ArrayList<>();
        roles.add(role);
        newUser.setRoles(roles);
        userRep.save(newUser);
        System.out.println("User added successfully: " + newUser.getEmail());
        return newUser;
    }

    @Override
    public User getUser(Long userId) {

        return userRep.findById(userId).get();
    }

    @Override
    public User getUserById(Long userId) {

        return userRep.findById(userId).orElse(null);
    }

    @Override
    public List<String> getAllRoleNames() {
        return roleRep.findAll()
                .stream()
                .map(Role::getRole)
                .collect(Collectors.toList());
    }
}