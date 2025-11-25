package iuh.fit.ecommerce.dtos.response.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingStatisticsResponse {
    private Double averageRating;
    private Integer totalReviews;
    private Map<Integer, Long> ratingDistribution; // Key: số sao (1-5), Value: số lượng
}
