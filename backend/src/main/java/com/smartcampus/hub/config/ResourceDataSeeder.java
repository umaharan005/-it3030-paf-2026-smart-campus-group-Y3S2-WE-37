package com.smartcampus.hub.config;

import com.smartcampus.hub.entity.catalogue.Resource;
import com.smartcampus.hub.enums.catalogue.ResourceStatus;
import com.smartcampus.hub.enums.catalogue.ResourceType;
import com.smartcampus.hub.repository.catalogue.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds all campus halls, labs, and library meeting rooms into the database
 * on first startup only (skips if resources already exist).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ResourceDataSeeder implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) {
        if (resourceRepository.count() > 0) {
            log.info("Resources already seeded — skipping.");
            return;
        }

        List<Resource> resources = List.of(

            // ── NEW BUILDING / F BLOCK — 13th Floor ─────────────────────────
            res("13L E Lab", "Computer Lab", "F Block", "13th Floor", "F1303 / F1304",
                    ResourceType.LAB, 40, "08:00", "20:00"),
            res("13H C", "Lecture Hall", "F Block", "13th Floor", "F1308",
                    ResourceType.LECTURE_HALL, 60, "08:00", "20:00"),
            res("13H A", "Lecture Hall", "F Block", "13th Floor", "F1306",
                    ResourceType.LECTURE_HALL, 60, "08:00", "20:00"),
            res("13H B", "Lecture Hall", "F Block", "13th Floor", "F1307",
                    ResourceType.LECTURE_HALL, 60, "08:00", "20:00"),
            res("13L A Lab", "Computer Lab", "F Block", "13th Floor", "F1301",
                    ResourceType.LAB, 40, "08:00", "20:00"),
            res("13L B Lab", "Computer Lab", "F Block", "13th Floor", "F1302",
                    ResourceType.LAB, 40, "08:00", "20:00"),
            res("13L C Lab", "Computer Lab", "F Block", "13th Floor", "F1305",
                    ResourceType.LAB, 40, "08:00", "20:00"),
            res("13L D Lab", "Computer Lab", "F Block", "13th Floor", "13th Floor - D",
                    ResourceType.LAB, 40, "08:00", "20:00"),

            // ── NEW BUILDING / F BLOCK — 14th Floor ─────────────────────────
            res("14th Floor Hall", "Lecture Hall", "F Block", "14th Floor", "14th Floor Hall",
                    ResourceType.LECTURE_HALL, 100, "08:00", "22:00"),

            // ── F BLOCK — 5th Floor ──────────────────────────────────────────
            res("F501", "Classroom", "F Block", "5th Floor", "F503",
                    ResourceType.CLASSROOM, 50, "08:00", "20:00"),

            // ── MAIN BUILDING — 3rd Floor ────────────────────────────────────
            res("A307", "Classroom", "Main Building", "3rd Floor", "A303",
                    ResourceType.CLASSROOM, 50, "08:00", "20:00"),
            res("A308", "Classroom", "Main Building", "3rd Floor", "A304",
                    ResourceType.CLASSROOM, 50, "08:00", "20:00"),

            // ── MAIN BUILDING — 4th Floor ────────────────────────────────────
            res("A405 PC Lab", "Computer Lab", "Main Building", "4th Floor", "A405",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("A406 PC Lab", "Computer Lab", "Main Building", "4th Floor", "A406",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("A410 PC Lab", "Computer Lab", "Main Building", "4th Floor", "A410",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("A411 PC Lab", "Computer Lab", "Main Building", "4th Floor", "A412",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("B401 PC Lab", "Computer Lab", "Main Building", "4th Floor", "B401",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("8402 PC Lab", "Computer Lab", "Main Building", "4th Floor", "8402",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("B403 PC Lab", "Computer Lab", "Main Building", "4th Floor", "B403",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("B410 PC Lab", "Computer Lab", "Main Building", "4th Floor", "A411",
                    ResourceType.LAB, 30, "08:00", "20:00"),

            // ── MAIN BUILDING — 5th Floor ────────────────────────────────────
            res("A505", "Classroom", "Main Building", "5th Floor", "A503",
                    ResourceType.CLASSROOM, 50, "08:00", "20:00"),
            res("A506", "Classroom", "Main Building", "5th Floor", "A504",
                    ResourceType.CLASSROOM, 50, "08:00", "20:00"),
            res("A507", "Classroom", "Main Building", "5th Floor", "A505",
                    ResourceType.CLASSROOM, 50, "08:00", "20:00"),
            res("A509", "Classroom", "Main Building", "5th Floor", "A506",
                    ResourceType.CLASSROOM, 50, "08:00", "20:00"),
            res("8501", "Lecture Hall", "Main Building", "5th Floor", "B501",
                    ResourceType.LECTURE_HALL, 80, "08:00", "20:00"),
            res("B502", "Lecture Hall", "Main Building", "5th Floor", "B502",
                    ResourceType.LECTURE_HALL, 80, "08:00", "20:00"),
            res("8509", "Lecture Hall", "Main Building", "5th Floor", "A507",
                    ResourceType.LECTURE_HALL, 80, "08:00", "20:00"),

            // ── MAIN BUILDING — 6th Floor ────────────────────────────────────
            res("601 PC Lab", "Computer Lab", "Main Building", "6th Floor", "A601",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("602 PC Lab", "Computer Lab", "Main Building", "6th Floor", "A602",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("603 PC Lab", "Computer Lab", "Main Building", "6th Floor", "A603",
                    ResourceType.LAB, 30, "08:00", "20:00"),
            res("605 PC Lab", "Computer Lab", "Main Building", "6th Floor", "A604",
                    ResourceType.LAB, 30, "08:00", "20:00"),

            // ── LIBRARY — Meeting Rooms (5 rooms, max 2h, 4-5 members) ───────
            libraryRoom("Library Meeting Room 1", "LIB-MR-01"),
            libraryRoom("Library Meeting Room 2", "LIB-MR-02"),
            libraryRoom("Library Meeting Room 3", "LIB-MR-03"),
            libraryRoom("Library Meeting Room 4", "LIB-MR-04"),
            libraryRoom("Library Meeting Room 5", "LIB-MR-05")
        );

        resourceRepository.saveAll(resources);
        log.info("Seeded {} campus resources.", resources.size());
    }

    private Resource res(String name, String description, String building, String floor,
                          String roomCode, ResourceType type, int capacity,
                          String from, String to) {
        return Resource.builder()
                .name(name)
                .description(description)
                .building(building)
                .floor(floor)
                .roomCode(roomCode)
                .location(building + " · " + floor + " · " + roomCode)
                .type(type)
                .capacity(capacity)
                .status(ResourceStatus.ACTIVE)
                .availableFrom(from)
                .availableTo(to)
                .maxBookingHours(0)
                .minAttendees(0)
                .maxAttendees(0)
                .timeSlots(List.of("08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00", "18:00-20:00"))
                .build();
    }

    /** Library meeting rooms: max 2h, team of 4–5 only */
    private Resource libraryRoom(String name, String roomCode) {
        return Resource.builder()
                .name(name)
                .description("Library group study room. Bookable for up to 2 hours for teams of 4–5.")
                .building("Library")
                .floor("Ground Floor")
                .roomCode(roomCode)
                .location("Library · Ground Floor · " + roomCode)
                .type(ResourceType.MEETING_ROOM)
                .capacity(5)
                .status(ResourceStatus.ACTIVE)
                .availableFrom("08:00")
                .availableTo("20:00")
                .maxBookingHours(2)
                .minAttendees(4)
                .maxAttendees(5)
                .timeSlots(List.of("08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00"))
                .build();
    }
}
