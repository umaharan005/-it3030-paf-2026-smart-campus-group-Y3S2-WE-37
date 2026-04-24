package com.smartcampus.hub.dto;

public class AdminOverviewDto {
    private long totalUsers;
    private long staffUsers;
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;

    public AdminOverviewDto() {
    }

    public AdminOverviewDto(long totalUsers, long staffUsers, long totalTickets, long openTickets, long inProgressTickets) {
        this.totalUsers = totalUsers;
        this.staffUsers = staffUsers;
        this.totalTickets = totalTickets;
        this.openTickets = openTickets;
        this.inProgressTickets = inProgressTickets;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getStaffUsers() {
        return staffUsers;
    }

    public void setStaffUsers(long staffUsers) {
        this.staffUsers = staffUsers;
    }

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getOpenTickets() {
        return openTickets;
    }

    public void setOpenTickets(long openTickets) {
        this.openTickets = openTickets;
    }

    public long getInProgressTickets() {
        return inProgressTickets;
    }

    public void setInProgressTickets(long inProgressTickets) {
        this.inProgressTickets = inProgressTickets;
    }
}
