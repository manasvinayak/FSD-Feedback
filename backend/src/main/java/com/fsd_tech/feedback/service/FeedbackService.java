package com.fsd_tech.feedback.service;

import com.fsd_tech.feedback.entity.Feedback;
import com.fsd_tech.feedback.repository.FeedbackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);

    @Autowired
    private FeedbackRepository feedbackRepository;

    public List<Feedback> getAllFeedback() {
        logger.debug("Fetching all feedback from repository");
        return feedbackRepository.findAll();
    }

    public Feedback getFeedbackById(Long id) {
        logger.debug("Fetching feedback with ID: {}", id);
        return feedbackRepository.findById(id).orElse(null);
    }

    public Feedback createFeedback(Feedback feedback) {
        logger.debug("Creating new feedback in repository");
        return feedbackRepository.save(feedback);
    }

    public Feedback updateFeedback(Long id, Feedback feedbackDetails) {
        logger.debug("Updating feedback with ID: {}", id);
        
        return feedbackRepository.findById(id)
                .map(existingFeedback -> {
                    // Update the fields we want to change
                    existingFeedback.setName(feedbackDetails.getName());
                    existingFeedback.setEmail(feedbackDetails.getEmail());
                    existingFeedback.setContactNo(feedbackDetails.getContactNo());
                    existingFeedback.setOverallEventQuality(feedbackDetails.getOverallEventQuality());
                    existingFeedback.setTechContent(feedbackDetails.getTechContent());
                    existingFeedback.setVenueFacilities(feedbackDetails.getVenueFacilities());
                    existingFeedback.setOrgManagement(feedbackDetails.getOrgManagement());
                    existingFeedback.setComments(feedbackDetails.getComments());
                    
                    // Save the updated feedback
                    return feedbackRepository.save(existingFeedback);
                })
                .orElse(null);
    }

    public void deleteFeedback(Long id) {
        logger.debug("Deleting feedback with ID: {}", id);
        feedbackRepository.deleteById(id);
    }
    
    /**
     * Calculate statistics from all feedback submissions
     * @return Map containing various statistics about the feedback data
     */
    public Map<String, Object> getStatistics() {
        logger.debug("Calculating feedback statistics");
        List<Feedback> allFeedback = getAllFeedback();
        
        // Initialize statistics map
        Map<String, Object> statistics = new HashMap<>();
        
        // If no feedback data exists, return empty statistics
        if (allFeedback.isEmpty()) {
            statistics.put("count", 0);
            statistics.put("averageOverallRating", 0.0);
            statistics.put("averageTechContentRating", 0.0);
            statistics.put("averageVenueFacilitiesRating", 0.0);
            statistics.put("averageOrgManagementRating", 0.0);
            statistics.put("uniqueParticipantsCount", 0);
            statistics.put("ratingDistribution", Map.of(
                "1", 0,
                "2", 0,
                "3", 0,
                "4", 0,
                "5", 0
            ));
            return statistics;
        }
        
        // Calculate total feedback count
        int count = allFeedback.size();
        statistics.put("count", count);
        
        // Calculate average ratings
        double avgOverall = allFeedback.stream()
                .mapToInt(Feedback::getOverallEventQuality)
                .average()
                .orElse(0.0);
        
        double avgTech = allFeedback.stream()
                .mapToInt(Feedback::getTechContent)
                .average()
                .orElse(0.0);
        
        double avgVenue = allFeedback.stream()
                .mapToInt(Feedback::getVenueFacilities)
                .average()
                .orElse(0.0);
        
        double avgOrg = allFeedback.stream()
                .mapToInt(Feedback::getOrgManagement)
                .average()
                .orElse(0.0);
        
        statistics.put("averageOverallRating", Math.round(avgOverall * 10.0) / 10.0);
        statistics.put("averageTechContentRating", Math.round(avgTech * 10.0) / 10.0);
        statistics.put("averageVenueFacilitiesRating", Math.round(avgVenue * 10.0) / 10.0);
        statistics.put("averageOrgManagementRating", Math.round(avgOrg * 10.0) / 10.0);
        
        // Calculate unique participants based on email addresses
        int uniqueParticipants = (int) allFeedback.stream()
                .map(Feedback::getEmail)
                .distinct()
                .count();
        
        statistics.put("uniqueParticipantsCount", uniqueParticipants);
        
        // Calculate rating distribution
        Map<String, Long> ratingDistribution = allFeedback.stream()
                .collect(Collectors.groupingBy(
                        f -> String.valueOf(f.getOverallEventQuality()),
                        Collectors.counting()
                ));
        
        // Ensure all rating values (1-5) are present in the distribution
        Map<String, Long> completeDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            String rating = String.valueOf(i);
            completeDistribution.put(rating, ratingDistribution.getOrDefault(rating, 0L));
        }
        
        statistics.put("ratingDistribution", completeDistribution);
        
        // Calculate completion rate (unique participants / total participants)
        double completionRate = (double) uniqueParticipants / count * 100;
        statistics.put("completionRate", Math.round(completionRate) + "%");
        
        return statistics;
    }
}
