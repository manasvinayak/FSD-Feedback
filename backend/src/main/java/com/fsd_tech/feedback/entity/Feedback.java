package com.fsd_tech.feedback.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique ID for each feedback entry, auto-generated", example = "1")
    private Long feedbackId;

    @CreationTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(nullable = false, updatable = false)
    @Schema(description = "Timestamp of when the feedback was recorded, auto-generated", example = "2024-10-10T10:30:00")
    private LocalDateTime dateTime;

    @Schema(description = "Full name of the person providing feedback", example = "John Doe")
    private String name;

    @Schema(description = "Email address of the participant", example = "john.doe@example.com")
    private String email;

    @Schema(description = "Contact number of the participant", example = "+919876543210")
    private String contactNo;

    @Schema(description = "Rating of the event quality", example = "4")
    private int overallEventQuality;

    @Schema(description = "Rating of the technical content", example = "5")
    private int techContent;

    @Schema(description = "Rating of the venue facilities", example = "3")
    private int venueFacilities;

    @Schema(description = "Rating of the organizational management", example = "4")
    private int orgManagement;

    @Schema(description = "Additional comments provided in the feedback", example = "Great event, but the venue was a bit small.")
    private String comments;

    // Default constructor
    public Feedback() {
    }

    // Getters and Setters
    public Long getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Long feedbackId) {
        this.feedbackId = feedbackId;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNo() {
        return contactNo;
    }

    public void setContactNo(String contactNo) {
        this.contactNo = contactNo;
    }

    public int getOverallEventQuality() {
        return overallEventQuality;
    }

    public void setOverallEventQuality(int overallEventQuality) {
        this.overallEventQuality = overallEventQuality;
    }

    public int getTechContent() {
        return techContent;
    }

    public void setTechContent(int techContent) {
        this.techContent = techContent;
    }

    public int getVenueFacilities() {
        return venueFacilities;
    }

    public void setVenueFacilities(int venueFacilities) {
        this.venueFacilities = venueFacilities;
    }

    public int getOrgManagement() {
        return orgManagement;
    }

    public void setOrgManagement(int orgManagement) {
        this.orgManagement = orgManagement;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    @Override
    public String toString() {
        return "Feedback{" +
                "feedbackId=" + feedbackId +
                ", dateTime=" + dateTime +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", contactNo='" + contactNo + '\'' +
                ", overallEventQuality=" + overallEventQuality +
                ", techContent=" + techContent +
                ", venueFacilities=" + venueFacilities +
                ", orgManagement=" + orgManagement +
                ", comments='" + comments + '\'' +
                '}';
    }
}
