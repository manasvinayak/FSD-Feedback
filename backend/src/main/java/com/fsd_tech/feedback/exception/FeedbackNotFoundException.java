package com.fsd_tech.feedback.exception;

public class FeedbackNotFoundException extends RuntimeException {
    public FeedbackNotFoundException(Long id) {
        super("Feedback not found with ID: " + id);
    }
}

