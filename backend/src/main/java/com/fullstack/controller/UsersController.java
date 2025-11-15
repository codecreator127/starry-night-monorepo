package com.fullstack.controller;


import com.fullstack.api.UsersApi;
import com.fullstack.model.User;
import com.fullstack.model.UserDto;
import com.fullstack.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class UsersController implements UsersApi {

    UserRepository userRepository;

    @Override
    public ResponseEntity<UserDto> getUserByUsername(String username) {
        User user = userRepository.findByUsername(username);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getUsername());

        return ResponseEntity.ok(userDto);
    }
}
