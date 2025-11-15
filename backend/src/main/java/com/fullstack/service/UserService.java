package com.fullstack.service;

import com.fullstack.model.User;
import com.fullstack.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new user with hashed password
     */
    public User createUser(String username, String rawPassword) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(username);
        user.setHashedPassword(passwordEncoder.encode(rawPassword)); // 🔑 hash here
        return userRepository.save(user);
    }

    /**
     * Spring Security calls this to check username + password
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getHashedPassword()) // hashed password stored in DB
                .roles("USER")
                .build();
    }
}
