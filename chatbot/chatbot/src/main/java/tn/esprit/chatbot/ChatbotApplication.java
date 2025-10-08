package tn.esprit.chatbot;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


@SpringBootApplication
public class ChatbotApplication {

	@PostConstruct
	void init_users() {

		//ajouter les rôles
		/*userService.addRole(new Role(null,"ADMIN"));
		userService.addRole(new Role(null,"USER"));*/

		/*userService.addRole(new Role(null,"ADMIN", null));
		userService.addRole(new Role(null,"USER", null));*/

		//ajouter les users
		//userService.saveUser(new User(null,"admin","admin",true,null,null,null));
		/*userService.saveUser(new User(null,"asma","123456789",true,"asmasellami2@gmail.com",null));
		userService.saveUser(new User(null,"test","test",false,"test@gmail.com",null));*/
		/*
		userService.saveUser(new User(null,"asma","asma",true,null,null,null));

		//ajouter les rôles aux users
		userService.addRoleToUser("admin", "ADMIN");
		userService.addRoleToUser("admin", "USER");

		userService.addRoleToUser("asma", "USER");
		//userService.addRoleToUser("test", "USER");
*/

	}

	@Bean
	BCryptPasswordEncoder getBCE() {
		return new BCryptPasswordEncoder();

	}
	public static void main(String[] args) {
		SpringApplication.run(ChatbotApplication.class, args);
	}
}
