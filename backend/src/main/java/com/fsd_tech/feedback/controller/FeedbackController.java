package com.fsd_tech.feedback.controller;

import com.fsd_tech.feedback.entity.Feedback;
import com.fsd_tech.feedback.exception.FeedbackNotFoundException;
import com.fsd_tech.feedback.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@Tag(name = "Feedback API", description = "Operations related to feedback")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
public class FeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping
    @Operation(summary = "Get all feedback", description = "Retrieve all feedback records")
    public List<Feedback> getAllFeedback() {
        logger.info("Fetching all feedback records");
        return feedbackService.getAllFeedback();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get feedback by ID", description = "Retrieve a specific feedback record by its ID")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable Long id) {
        logger.info("Fetching feedback with ID: {}", id);
        Feedback feedback = feedbackService.getFeedbackById(id);
        if (feedback == null) {
            logger.warn("Feedback not found with ID: {}", id);
            throw new FeedbackNotFoundException(id);
        }
        return ResponseEntity.ok(feedback);
    }

    @PostMapping
    @Operation(summary = "Create feedback", description = "Create a new feedback record")
    public Feedback createFeedback(@RequestBody Feedback feedback) {
        logger.info("Creating new feedback: {}", feedback);
        logger.debug("Feedback details - Name: {}, Email: {}, Contact: {}", 
            feedback.getName(), feedback.getEmail(), feedback.getContactNo());
        
        // Let the database handle feedbackId and dateTime
        // feedbackId is auto-generated, and dateTime is set by @CreationTimestamp
        Feedback savedFeedback = feedbackService.createFeedback(feedback);
        logger.info("Feedback created successfully with ID: {}", savedFeedback.getFeedbackId());
        return savedFeedback;
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update feedback", description = "Update an existing feedback record by its ID")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody Feedback feedbackDetails) {
        logger.info("Updating feedback with ID: {}", id);
        logger.debug("Updated feedback details: {}", feedbackDetails);
        
        // Make sure we don't override the dateTime value
        Feedback existingFeedback = feedbackService.getFeedbackById(id);
        if (existingFeedback == null) {
            logger.warn("Feedback not found for update with ID: {}", id);
            throw new FeedbackNotFoundException(id);
        }
        
        // Keep the original dateTime from the database
        feedbackDetails.setDateTime(existingFeedback.getDateTime());
        
        Feedback updatedFeedback = feedbackService.updateFeedback(id, feedbackDetails);
        logger.info("Feedback updated successfully with ID: {}", id);
        return ResponseEntity.ok(updatedFeedback);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete feedback", description = "Delete a feedback record by its ID")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        logger.info("Deleting feedback with ID: {}", id);
        Feedback feedback = feedbackService.getFeedbackById(id);
        if (feedback == null) {
            logger.warn("Feedback not found for deletion with ID: {}", id);
            throw new FeedbackNotFoundException(id);
        }
        feedbackService.deleteFeedback(id);
        logger.info("Feedback deleted successfully with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get feedback statistics", description = "Retrieve statistics about all feedback")
    public ResponseEntity<Object> getStatistics() {
        logger.info("Fetching feedback statistics");
        return ResponseEntity.ok(feedbackService.getStatistics());
    }
}
