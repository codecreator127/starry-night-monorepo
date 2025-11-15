package com.fullstack.controller;

import com.fullstack.api.AuthenticationApi;
import com.fullstack.model.Login200Response;
import com.fullstack.model.LoginRequest;
import com.fullstack.model.Logout200Response;
import com.fullstack.service.JwtService;
import com.fullstack.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class AuthController implements AuthenticationApi {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    @Override
    public ResponseEntity<Login200Response> register(LoginRequest registerRequest) {

        userService.createUser(registerRequest.getUsername(), registerRequest.getPassword());

        // After successful registration, automatically log in the user
        return login(registerRequest);
    }

    @Override
    public ResponseEntity<Login200Response> login(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(userDetails);

        Login200Response response = new Login200Response();
        response.setToken(jwtToken);
        return ResponseEntity.ok(response);
    }

    // don't actually need this, client side should remove jwt token once logout
    @Override
    public ResponseEntity<Logout200Response> logout() {
        Logout200Response response = new Logout200Response();
        return ResponseEntity.ok(response);
    }
}
