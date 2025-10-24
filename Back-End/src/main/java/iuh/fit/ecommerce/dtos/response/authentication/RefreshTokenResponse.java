package iuh.fit.ecommerce.dtos.response.authentication;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RefreshTokenResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
}
