package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.enums.TicketCategory;
import com.example.smart_campus_operation_hub.enums.TicketPriority;
import com.example.smart_campus_operation_hub.enums.TicketStatus;
import com.example.smart_campus_operation_hub.model.Ticket;
import com.example.smart_campus_operation_hub.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketTriageService {

    private static final Map<TicketCategory, List<String>> CATEGORY_KEYWORDS = new EnumMap<>(TicketCategory.class);
    private static final Map<TicketPriority, List<String>> PRIORITY_KEYWORDS = new EnumMap<>(TicketPriority.class);

    static {
        CATEGORY_KEYWORDS.put(TicketCategory.IT_ISSUE, Arrays.asList(
            // Network & connectivity
            "wifi", "wi-fi", "wireless", "internet", "network", "lan", "ethernet", "vpn",
            "bandwidth", "connection", "signal", "hotspot", "router", "switch", "access point",
            "firewall", "no internet", "slow internet", "no signal", "dns", "ip address",
            "ping", "disconnect", "disconnected", "no wifi", "offline",
            // Devices & hardware
            "computer", "laptop", "desktop", "pc", "workstation", "server", "tablet", "ipad",
            "monitor", "screen", "display", "keyboard", "mouse", "usb", "hdmi", "vga", "cable",
            "headphone", "speaker", "microphone", "mic", "webcam", "camera", "charger",
            "battery", "power cable", "docking station",
            // Printers & peripherals
            "printer", "print", "printing", "scanner", "scan", "photocopy", "copier", "plotter",
            "toner", "ink", "paper jam", "shredder", "cannot print", "print not working",
            // Software & systems
            "software", "app", "application", "program", "system", "crash", "error", "freeze",
            "frozen", "blue screen", "bsod", "virus", "malware", "antivirus", "update",
            "install", "license", "browser", "website", "portal", "lms", "moodle", "email",
            "outlook", "teams", "zoom", "excel", "word", "powerpoint", "slow computer",
            "slow laptop", "hanging", "not responding", "force quit",
            // Access & accounts
            "password", "login", "log in", "account", "username", "locked out",
            "authentication", "2fa", "credentials", "reset password", "access denied",
            "permission", "forgot password", "cannot login", "cannot log in",
            // AV & projectors
            "projector", "smartboard", "smart board", "whiteboard", "av", "audio", "video",
            "sound", "no sound", "no display", "projector not working", "screen not showing"
        ));

        CATEGORY_KEYWORDS.put(TicketCategory.SAFETY, Arrays.asList(
            // Fire & gas
            "fire", "smoke", "flame", "burning", "gas", "gas leak", "explosion", "blast",
            // Electrical hazards
            "electric", "electrical", "shock", "live wire", "exposed wire", "sparks",
            "short circuit", "power outage", "blackout", "outlet", "socket",
            // Structural & physical
            "collapse", "structural", "ceiling fell", "roof caving", "broken stairs",
            "broken step", "railing", "broken railing", "broken glass", "sharp", "trip",
            "fall", "slip", "slippery", "wet floor", "dark corridor", "no lighting",
            "poor lighting", "unlit", "blocked path",
            // Flooding
            "flood", "flooding", "water leak", "pipe burst", "overflow",
            // Medical
            "injury", "injured", "bleeding", "unconscious", "faint", "fainting", "medical",
            "ambulance", "first aid", "accident", "hurt",
            // Security threats
            "hazard", "danger", "dangerous", "emergency", "alarm", "unsafe", "threat",
            "intruder", "suspicious", "unauthorized person", "theft", "robbery", "evacuate",
            "blocked exit", "fire door", "emergency exit",
            // Chemical
            "chemical", "fumes", "toxic", "spill", "radiation", "biohazard"
        ));

        CATEGORY_KEYWORDS.put(TicketCategory.FACILITY_DAMAGE, Arrays.asList(
            // Structural surfaces
            "crack", "cracked", "wall", "ceiling", "floor", "roof", "plaster", "concrete",
            "collapsed", "falling", "dent", "hole", "damaged", "shattered", "structural damage",
            // Doors & windows
            "door", "window", "glass", "broken glass", "lock", "handle", "hinge",
            "door knob", "key", "door not closing", "window broken", "door stuck",
            // Flooring & surfaces
            "tile", "carpet", "grout", "paint", "paint peeling", "stain", "graffiti",
            "scratch", "scratched", "worn out floor",
            // Plumbing & drainage
            "pipe", "plumbing", "drainage", "gutter", "sewer", "drain", "blocked drain",
            "clogged", "water damage", "leaking pipe", "dripping", "tap", "faucet",
            // Lighting fixtures
            "light", "bulb", "tube light", "fluorescent", "lamp", "lighting", "broken light",
            "light not working", "flickering", "flicker", "no light in room",
            // Furniture & fittings
            "furniture", "chair", "table", "desk", "bench", "locker", "cabinet", "shelf",
            "shelf fell", "vandal", "vandalism",
            // External & infrastructure
            "fence", "gate", "barrier", "path", "pathway", "ramp", "parking", "signage",
            "sign broken", "notice board"
        ));

        CATEGORY_KEYWORDS.put(TicketCategory.EQUIPMENT_MALFUNCTION, Arrays.asList(
            // HVAC & climate
            "air conditioner", "ac", "a/c", "air con", "fan", "heater", "ventilation",
            "vent", "hvac", "cooling", "heating", "temperature", "hot room", "cold room",
            "no air conditioning", "ac not working", "fan not working",
            // Elevators & access
            "elevator", "lift", "stuck in elevator", "stuck in lift", "escalator",
            "elevator not working", "lift broken",
            // Power & backup
            "generator", "ups", "power backup", "pump", "motor", "inverter",
            // AV & presentation
            "projector", "smartboard", "pa system", "intercom", "sound system", "stage light",
            "microphone not working", "speaker not working",
            // Kitchen & refreshment
            "fridge", "freezer", "cooler", "microwave", "oven", "kettle",
            "vending machine", "water cooler", "dispenser", "coffee machine", "water heater",
            // Office equipment
            "photocopier", "copier", "shredder",
            // Security equipment
            "cctv", "security camera", "access control", "turnstile", "gate barrier",
            "card reader", "door access", "swipe card", "key fob",
            // General malfunction terms
            "machine", "malfunction", "not working", "broken down", "equipment", "appliance",
            "stopped working", "wont turn on", "won't turn on", "no power", "dead machine",
            "keeps turning off", "overheating",
            // Gym & sports
            "treadmill", "gym", "exercise machine",
            // Laundry
            "washing machine", "dryer", "laundry machine"
        ));

        CATEGORY_KEYWORDS.put(TicketCategory.CLEANING, Arrays.asList(
            // General cleanliness
            "dirty", "unclean", "filthy", "unhygienic", "dusty", "dust", "stain", "stained",
            "clean", "cleaning needed", "not cleaned",
            // Waste & disposal
            "trash", "garbage", "waste", "litter", "bin", "overflowing bin", "full bin",
            "recycling", "rubbish", "waste bin full",
            // Spills & mess
            "spill", "spillage", "mess", "wet floor", "puddle", "water puddle", "grease",
            "oil stain", "food waste", "food on floor",
            // Bathrooms & sanitation
            "bathroom", "toilet", "restroom", "washroom", "sink", "urinal",
            "blocked toilet", "toilet clogged", "toilet overflow", "no soap", "no paper",
            "tissue", "toilet paper", "hand sanitizer", "paper towel", "soap dispenser",
            "bathroom dirty", "washroom smell",
            // Odor
            "odor", "smell", "stink", "bad smell", "foul smell", "terrible smell",
            "unpleasant smell",
            // Pests
            "mold", "mould", "cockroach", "roach", "pest", "rat", "mice", "mouse",
            "insect", "bug", "ant", "mosquito", "fly", "flies", "spider", "cobweb",
            "infestation", "rodent",
            // Outdoor & common areas
            "leaves", "debris", "mud", "dirt path", "bird droppings", "pigeon",
            "outdoor mess", "corridor dirty", "hallway dirty", "staircase dirty",
            // Specific mess types
            "vomit", "blood stain"
        ));

        PRIORITY_KEYWORDS.put(TicketPriority.CRITICAL, Arrays.asList(
            "fire", "flood", "gas leak", "collapse", "injury", "emergency", "power outage",
            "server down", "data loss", "critical", "immediately", "right now", "danger",
            "smoke", "evacuate", "explosion", "ambulance", "life threatening", "unconscious",
            "not breathing", "trapped", "stuck in elevator", "stuck in lift", "toxic",
            "chemical spill", "widespread", "all floors", "building wide", "campus wide",
            "major outage", "severe", "sparks", "short circuit", "bleeding", "burst pipe",
            "blackout", "security breach", "intruder", "active threat", "bomb", "faint"
        ));

        PRIORITY_KEYWORDS.put(TicketPriority.HIGH, Arrays.asList(
            "urgent", "not working", "broken", "many users", "classroom", "exam", "exam hall",
            "presentation", "multiple people", "affecting many", "asap", "everyone",
            "whole building", "entire floor", "no access", "blocked", "lecture", "conference",
            "meeting", "event", "many students", "disabled access", "wheelchair",
            "accessibility", "dean", "principal", "vip", "disrupting", "classes affected",
            "cannot use", "deadline", "today", "tonight", "this morning", "this afternoon",
            "entire class", "students affected", "staff affected", "cannot work"
        ));

        PRIORITY_KEYWORDS.put(TicketPriority.MEDIUM, Arrays.asList(
            "slow", "intermittent", "sometimes", "occasional", "issue", "problem",
            "struggling", "difficulty", "not always", "regularly", "been happening",
            "for a week", "few days", "recurring", "keeps happening", "on and off",
            "happening again", "noticed", "affects some", "partial"
        ));

        PRIORITY_KEYWORDS.put(TicketPriority.LOW, Arrays.asList(
            "minor", "small", "would be nice", "whenever", "no rush", "suggestion",
            "slight", "barely", "cosmetic", "when possible", "not urgent", "low priority",
            "at your convenience", "eventually", "sometime", "future", "nice to have",
            "not a big deal", "hardly", "aesthetic"
        ));
    }

    private final TicketRepository ticketRepository;

    public TicketTriageService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public TriageResult analyze(String description) {
        if (description == null || description.trim().length() < 3) {
            return null;
        }

        String lower = description.toLowerCase(Locale.ROOT);

        TicketCategory bestCategory = scoreCategory(lower);
        TicketPriority bestPriority = scorePriority(lower);

        int matchCount = countMatches(lower, CATEGORY_KEYWORDS.get(bestCategory));
        double confidence = Math.min(1.0, matchCount * 0.25 + 0.4);

        List<SimilarTicket> similar = findSimilarTickets(bestCategory, description);
        String reasoning = buildReasoning(lower, bestCategory, bestPriority);

        return new TriageResult(bestCategory.name(), bestPriority.name(), confidence, reasoning, similar);
    }

    private TicketCategory scoreCategory(String lower) {
        TicketCategory best = TicketCategory.OTHER;
        int bestScore = 0;
        for (Map.Entry<TicketCategory, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int score = countMatches(lower, entry.getValue());
            if (score > bestScore) {
                bestScore = score;
                best = entry.getKey();
            }
        }
        return best;
    }

    private TicketPriority scorePriority(String lower) {
        for (TicketPriority p : new TicketPriority[]{TicketPriority.CRITICAL, TicketPriority.HIGH, TicketPriority.MEDIUM}) {
            if (countMatches(lower, PRIORITY_KEYWORDS.get(p)) > 0) {
                return p;
            }
        }
        return TicketPriority.LOW;
    }

    private int countMatches(String text, List<String> keywords) {
        if (keywords == null) return 0;
        return (int) keywords.stream().filter(text::contains).count();
    }

    private String buildReasoning(String lower, TicketCategory category, TicketPriority priority) {
        List<String> catMatches = CATEGORY_KEYWORDS.getOrDefault(category, List.of())
                .stream().filter(lower::contains).limit(3).collect(Collectors.toList());
        List<String> priMatches = PRIORITY_KEYWORDS.getOrDefault(priority, List.of())
                .stream().filter(lower::contains).limit(2).collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        if (!catMatches.isEmpty()) {
            sb.append("Category suggested based on: ").append(String.join(", ", catMatches)).append(". ");
        }
        if (!priMatches.isEmpty()) {
            sb.append("Priority set to ").append(priority).append(" due to: ").append(String.join(", ", priMatches)).append(".");
        } else {
            sb.append("No urgent keywords detected — defaulting to ").append(priority).append(" priority.");
        }
        return sb.toString();
    }

    private List<SimilarTicket> findSimilarTickets(TicketCategory category, String description) {
        List<Ticket> candidates = ticketRepository.findTop10ByCategoryAndStatusIn(
                category,
                Arrays.asList(TicketStatus.RESOLVED, TicketStatus.CLOSED)
        );

        String[] words = description.toLowerCase(Locale.ROOT).split("\\s+");

        return candidates.stream()
                .map(t -> {
                    long overlap = Arrays.stream(words)
                            .filter(w -> w.length() > 3 && t.getDescription().toLowerCase(Locale.ROOT).contains(w))
                            .count();
                    return new Object[]{t, overlap};
                })
                .filter(pair -> (long) pair[1] > 1)
                .sorted((a, b) -> Long.compare((long) b[1], (long) a[1]))
                .limit(3)
                .map(pair -> {
                    Ticket t = (Ticket) pair[0];
                    String desc = t.getDescription().length() > 120
                            ? t.getDescription().substring(0, 120) + "…"
                            : t.getDescription();
                    String res = t.getResolutionNotes() == null ? null
                            : (t.getResolutionNotes().length() > 150
                                    ? t.getResolutionNotes().substring(0, 150) + "…"
                                    : t.getResolutionNotes());
                    return new SimilarTicket(t.getId(), desc, res, t.getCategory().name(), t.getPriority().name());
                })
                .collect(Collectors.toList());
    }

    public static class TriageResult {
        private final String suggestedCategory;
        private final String suggestedPriority;
        private final double confidence;
        private final String reasoning;
        private final List<SimilarTicket> similarTickets;

        public TriageResult(String suggestedCategory, String suggestedPriority,
                            double confidence, String reasoning, List<SimilarTicket> similarTickets) {
            this.suggestedCategory = suggestedCategory;
            this.suggestedPriority = suggestedPriority;
            this.confidence = confidence;
            this.reasoning = reasoning;
            this.similarTickets = similarTickets;
        }

        public String getSuggestedCategory() { return suggestedCategory; }
        public String getSuggestedPriority() { return suggestedPriority; }
        public double getConfidence() { return confidence; }
        public String getReasoning() { return reasoning; }
        public List<SimilarTicket> getSimilarTickets() { return similarTickets; }
    }

    public static class SimilarTicket {
        private final Long id;
        private final String description;
        private final String resolution;
        private final String category;
        private final String priority;

        public SimilarTicket(Long id, String description, String resolution, String category, String priority) {
            this.id = id;
            this.description = description;
            this.resolution = resolution;
            this.category = category;
            this.priority = priority;
        }

        public Long getId() { return id; }
        public String getDescription() { return description; }
        public String getResolution() { return resolution; }
        public String getCategory() { return category; }
        public String getPriority() { return priority; }
    }
}
