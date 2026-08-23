package com.minutebook.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.minutebook.model.ActionItem;
import com.minutebook.model.Chapter;
import com.minutebook.model.KeyDecision;
import com.minutebook.model.TranscriptSegment;
import com.minutebook.model.enums.Priority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Implements the 4-stage LLM prompt chain using Google Gemini 2.5 Flash.
 *
 * Stage A: Chunk Summarization (map step)
 * Stage B: Decision & Action Item Extraction (structured JSON)
 * Stage C: Final Executive Summary (reduce step)
 * Stage D: Auto-Chapter Titling (stretch)
 */
@Service
public class SummarizationService {

    private static final Logger log = LoggerFactory.getLogger(SummarizationService.class);
    private static final int CHUNK_SIZE_CHARS = 12000;  // ~3000 tokens at ~4 chars/token
    private static final int OVERLAP_CHARS = 800;       // ~200 tokens overlap

    private final RestClient geminiRestClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public SummarizationService(
            @Qualifier("geminiRestClient") RestClient geminiRestClient,
            ObjectMapper objectMapper,
            @Value("${app.gemini.api-key}") String apiKey) {
        this.geminiRestClient = geminiRestClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    /**
     * Run the full prompt chain. Returns a SummarizationResult with all extracted data.
     */
    public SummarizationResult summarize(List<TranscriptSegment> segments) {
        log.info("Starting summarization pipeline for {} segments", segments.size());

        // Build full transcript text with timestamps
        String fullTranscript = buildTimestampedTranscript(segments);

        // Stage A: Chunk Summarization
        List<String> chunkSummaries = stageA_chunkSummarize(fullTranscript);
        log.info("Stage A complete: {} chunk summaries", chunkSummaries.size());

        // Stage B: Decision & Action Item Extraction
        ExtractionResult extraction = stageB_extract(chunkSummaries);
        log.info("Stage B complete: {} decisions, {} action items",
                extraction.decisions().size(), extraction.actionItems().size());

        // Stage C: Final Executive Summary
        String executiveSummary = stageC_executiveSummary(chunkSummaries, extraction);
        log.info("Stage C complete: executive summary generated");

        // Stage D: Auto-Chapter Titling
        List<Chapter> chapters = stageD_chapterTitles(chunkSummaries, segments);
        log.info("Stage D complete: {} chapters", chapters.size());

        return new SummarizationResult(
                executiveSummary,
                extraction.decisions(),
                extraction.actionItems(),
                chapters
        );
    }

    // ── Stage A: Chunk Summarization ──────────────────────────────────────────

    private List<String> stageA_chunkSummarize(String transcript) {
        List<String> chunks = splitIntoChunks(transcript);
        List<String> summaries = new ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {
            String systemPrompt = """
                    You are an expert analyst and senior meeting scribe. You will be given one segment
                    of a meeting or audio recording transcript, with speaker labels and timestamps.
                    Produce a detailed, high-fidelity synthesis of this segment:
                    - Comprehensive coverage of main topics, narratives, arguments, and themes
                    - Specific details, names, quotes, figures, context, and key insights
                    - Any consensus, decisions, debates, or differing viewpoints
                    - Any tasks, commitments, assignments, or next steps mentioned
                    Be thorough, structured, and informative. Avoid vague summaries or cutting out important context.""";

            String userPrompt = String.format(
                    "Transcript segment (chunk %d of %d):\n\n%s",
                    i + 1, chunks.size(), chunks.get(i));

            String summary = callGemini(systemPrompt, userPrompt, false);
            summaries.add(summary);
        }

        return summaries;
    }

    // ── Stage B: Decision & Action Item Extraction ────────────────────────────

    private ExtractionResult stageB_extract(List<String> chunkSummaries) {
        String combinedSummaries = String.join("\n\n---\n\n", chunkSummaries);

        String systemPrompt = """
                You are a structured extraction engine. Read the meeting synthesis below and output
                ONLY valid JSON matching the schema given. Do not include markdown code fences or any text
                outside the JSON.
                
                If no decisions were made or no action items exist (such as for stories, lectures, presentations, or general discussions), return empty arrays `[]` rather than fabricating placeholders.
                
                Schema:
                {
                  "decisions": [
                    { "decision": "string", "context": "string", "source_timestamp": "string or null" }
                  ],
                  "action_items": [
                    { "task": "string", "owner": "string or null", "deadline": "string or null",
                      "priority": "high or medium or low", "source_timestamp": "string or null" }
                  ]
                }""";

        String userPrompt = "Meeting synthesis notes:\n\n" + combinedSummaries;

        String jsonResponse = callGeminiJson(systemPrompt, userPrompt);
        return parseExtractionResult(jsonResponse);
    }

    // ── Stage C: Final Executive Summary ──────────────────────────────────────

    private String stageC_executiveSummary(List<String> chunkSummaries, ExtractionResult extraction) {
        String combinedSummaries = String.join("\n\n", chunkSummaries);

        String decisionsJson;
        String actionItemsJson;
        try {
            decisionsJson = objectMapper.writeValueAsString(extraction.decisions().stream()
                    .map(d -> {
                        ObjectNode node = objectMapper.createObjectNode();
                        node.put("decision", d.getDecision());
                        node.put("context", d.getContext());
                        return node;
                    }).toList());
            actionItemsJson = objectMapper.writeValueAsString(extraction.actionItems().stream()
                    .map(a -> {
                        ObjectNode node = objectMapper.createObjectNode();
                        node.put("task", a.getTask());
                        node.put("owner", a.getOwner());
                        node.put("deadline", a.getDeadline());
                        return node;
                    }).toList());
        } catch (JsonProcessingException e) {
            decisionsJson = "[]";
            actionItemsJson = "[]";
        }

        String systemPrompt = """
                You are a world-class executive writer and senior intelligence analyst creating a comprehensive, beautifully structured summary of a recorded discussion or meeting.
                
                Your goal is to provide deep clarity, thorough insight, and full context so that anyone reading this has a complete, nuanced understanding of what transpired.
                
                Structure your output with clean, elegant Markdown:
                
                ### Executive Overview
                Write 2-3 thorough, engaging paragraphs detailing the overarching purpose, context, core narratives, themes, and key conclusions of the recording.
                
                ### Key Discussion Points & Insights
                Provide in-depth, organized bullet points covering each major topic, argument, story, technical detail, or debate explored during the session. Include specific names, examples, and nuances.
                
                ### Key Takeaways & Decisions
                Summarize the primary conclusions, consensus, decisions, or philosophical/strategic takeaways.
                
                ### Next Steps & Action Items
                If concrete tasks or follow-ups were assigned, list them with owners and timelines. If no action items were discussed, simply omit this section completely (never write 'no action items assigned').
                
                Formatting & Tone:
                - Professional, articulate, detailed, and rich in substance.
                - Do not use lazy generic summaries or artificial word count caps.
                - Do not write meta-introductions like 'This summary discusses...' — dive straight into the synthesis.""";

        String userPrompt = String.format("""
                Detailed segment notes:
                %s
                
                Extracted decisions:
                %s
                
                Extracted action items:
                %s""", combinedSummaries, decisionsJson, actionItemsJson);

        return callGemini(systemPrompt, userPrompt, false);
    }

    // ── Stage D: Auto-Chapter Titling ─────────────────────────────────────────

    private List<Chapter> stageD_chapterTitles(List<String> chunkSummaries, List<TranscriptSegment> segments) {
        StringBuilder sb = new StringBuilder();
        List<String> chunks = splitIntoChunks(buildTimestampedTranscript(segments));
        for (int i = 0; i < chunkSummaries.size() && i < chunks.size(); i++) {
            String startTs = extractFirstTimestamp(chunks.get(i));
            sb.append(String.format("Chunk %d (starts ~%s):\n%s\n\n", i + 1, startTs, chunkSummaries.get(i)));
        }

        String systemPrompt = """
                Given timestamped summaries from an audio recording, group them into 3-6
                coherent topical chapters. For each chapter, output a descriptive title (3-7 words)
                and its start timestamp in seconds.
                Output ONLY valid JSON:
                [{ "title": "string", "start_timestamp": "string" }]""";

        String userPrompt = sb.toString();

        String jsonResponse = callGeminiJson(systemPrompt, userPrompt);
        return parseChapterResult(jsonResponse);
    }

    // ── Gemini API calls ──────────────────────────────────────────────────────

    private String callGemini(String systemPrompt, String userPrompt, boolean jsonMode) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ObjectNode systemPart = objectMapper.createObjectNode();
            systemPart.put("text", systemPrompt);
            ArrayNode systemParts = objectMapper.createArrayNode();
            systemParts.add(systemPart);
            systemInstruction.set("parts", systemParts);
            requestBody.set("systemInstruction", systemInstruction);

            // User content
            ArrayNode contents = objectMapper.createArrayNode();
            ObjectNode content = objectMapper.createObjectNode();
            content.put("role", "user");
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", userPrompt);
            ArrayNode parts = objectMapper.createArrayNode();
            parts.add(part);
            content.set("parts", parts);
            contents.add(content);
            requestBody.set("contents", contents);

            // Generation config
            ObjectNode genConfig = objectMapper.createObjectNode();
            genConfig.put("temperature", 0.3);
            genConfig.put("maxOutputTokens", 4096);
            if (jsonMode) {
                genConfig.put("responseMimeType", "application/json");
            }
            requestBody.set("generationConfig", genConfig);

            String response = geminiRestClient.post()
                    .uri("/models/gemini-2.5-flash:generateContent?key=" + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return extractGeminiText(response);

        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }

    private String callGeminiJson(String systemPrompt, String userPrompt) {
        return callGemini(systemPrompt, userPrompt, true);
    }

    private String extractGeminiText(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.get("candidates");
            if (candidates != null && candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).get("content");
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && !parts.isEmpty()) {
                        return parts.get(0).get("text").asText();
                    }
                }
            }
            log.warn("Unexpected Gemini response structure: {}", response);
            return "";
        } catch (Exception e) {
            log.error("Failed to parse Gemini response", e);
            return "";
        }
    }

    // ── Parsing helpers ───────────────────────────────────────────────────────

    private ExtractionResult parseExtractionResult(String json) {
        try {
            // Clean up potential markdown code fences
            json = json.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("\\n?```$", "");
            }

            JsonNode root = objectMapper.readTree(json);
            List<KeyDecision> decisions = new ArrayList<>();
            List<ActionItem> actionItems = new ArrayList<>();

            JsonNode decisionsNode = root.get("decisions");
            if (decisionsNode != null && decisionsNode.isArray()) {
                for (JsonNode dn : decisionsNode) {
                    KeyDecision kd = new KeyDecision();
                    kd.setDecision(dn.get("decision").asText());
                    kd.setContext(dn.has("context") && !dn.get("context").isNull()
                            ? dn.get("context").asText() : null);
                    if (dn.has("source_timestamp") && !dn.get("source_timestamp").isNull()) {
                        try {
                            kd.setSourceTimestamp(new BigDecimal(dn.get("source_timestamp").asText()));
                        } catch (NumberFormatException ignored) {}
                    }
                    decisions.add(kd);
                }
            }

            JsonNode actionItemsNode = root.get("action_items");
            if (actionItemsNode != null && actionItemsNode.isArray()) {
                for (JsonNode an : actionItemsNode) {
                    ActionItem ai = new ActionItem();
                    ai.setTask(an.get("task").asText());
                    ai.setOwner(an.has("owner") && !an.get("owner").isNull()
                            ? an.get("owner").asText() : null);
                    ai.setDeadline(an.has("deadline") && !an.get("deadline").isNull()
                            ? an.get("deadline").asText() : null);
                    if (an.has("priority") && !an.get("priority").isNull()) {
                        try {
                            ai.setPriority(Priority.valueOf(an.get("priority").asText().toLowerCase()));
                        } catch (IllegalArgumentException e) {
                            ai.setPriority(Priority.medium);
                        }
                    }
                    if (an.has("source_timestamp") && !an.get("source_timestamp").isNull()) {
                        try {
                            ai.setSourceTimestamp(new BigDecimal(an.get("source_timestamp").asText()));
                        } catch (NumberFormatException ignored) {}
                    }
                    actionItems.add(ai);
                }
            }

            return new ExtractionResult(decisions, actionItems);

        } catch (Exception e) {
            log.error("Failed to parse Stage B extraction JSON: {}", json, e);
            return new ExtractionResult(List.of(), List.of());
        }
    }

    private List<Chapter> parseChapterResult(String json) {
        try {
            json = json.trim();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-z]*\\n?", "").replaceAll("\\n?```$", "");
            }

            JsonNode root = objectMapper.readTree(json);
            List<Chapter> chapters = new ArrayList<>();

            if (root.isArray()) {
                for (JsonNode cn : root) {
                    Chapter ch = new Chapter();
                    ch.setTitle(cn.get("title").asText());
                    if (cn.has("start_timestamp") && !cn.get("start_timestamp").isNull()) {
                        try {
                            ch.setStartTime(new BigDecimal(cn.get("start_timestamp").asText()));
                        } catch (NumberFormatException e) {
                            ch.setStartTime(BigDecimal.ZERO);
                        }
                    } else {
                        ch.setStartTime(BigDecimal.ZERO);
                    }
                    chapters.add(ch);
                }
            }

            return chapters;
        } catch (Exception e) {
            log.error("Failed to parse Stage D chapter JSON: {}", json, e);
            return List.of();
        }
    }

    // ── Text processing helpers ───────────────────────────────────────────────

    private String buildTimestampedTranscript(List<TranscriptSegment> segments) {
        StringBuilder sb = new StringBuilder();
        for (TranscriptSegment seg : segments) {
            String timestamp = formatTimestamp(seg.getStartTime());
            String speaker = seg.getSpeakerLabel() != null ? seg.getSpeakerLabel() : "Speaker";
            sb.append(String.format("[%s] %s: %s\n", timestamp, speaker, seg.getText()));
        }
        return sb.toString();
    }

    private List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();
        if (text.length() <= CHUNK_SIZE_CHARS) {
            chunks.add(text);
            return chunks;
        }

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + CHUNK_SIZE_CHARS, text.length());

            // Try to break at a newline boundary for cleaner chunks
            if (end < text.length()) {
                int lastNewline = text.lastIndexOf('\n', end);
                if (lastNewline > start + CHUNK_SIZE_CHARS / 2) {
                    end = lastNewline + 1;
                }
            }

            chunks.add(text.substring(start, end));
            start = end - OVERLAP_CHARS; // Overlap for context continuity
            if (start < 0) start = 0;
        }

        return chunks;
    }

    private String extractFirstTimestamp(String chunkText) {
        // Looks for [MM:SS] or [HH:MM:SS] pattern
        int bracketStart = chunkText.indexOf('[');
        if (bracketStart >= 0) {
            int bracketEnd = chunkText.indexOf(']', bracketStart);
            if (bracketEnd > bracketStart) {
                return chunkText.substring(bracketStart + 1, bracketEnd);
            }
        }
        return "00:00";
    }

    private String formatTimestamp(BigDecimal seconds) {
        if (seconds == null) return "00:00";
        int totalSecs = seconds.intValue();
        int hrs = totalSecs / 3600;
        int mins = (totalSecs % 3600) / 60;
        int secs = totalSecs % 60;
        if (hrs > 0) {
            return String.format("%d:%02d:%02d", hrs, mins, secs);
        }
        return String.format("%02d:%02d", mins, secs);
    }

    // ── Result records ────────────────────────────────────────────────────────

    public record ExtractionResult(
            List<KeyDecision> decisions,
            List<ActionItem> actionItems
    ) {}

    public record SummarizationResult(
            String executiveSummary,
            List<KeyDecision> decisions,
            List<ActionItem> actionItems,
            List<Chapter> chapters
    ) {}
}
