# Swallern Analytics Events v1

## Core events
- search_submitted
- search_result_opened
- topic_viewed
- source_clicked
- media_started
- media_completed
- related_topic_clicked
- lesson_started
- lesson_completed
- quiz_started
- quiz_completed
- topic_saved
- sign_in_started
- sign_in_completed

## Event properties
Where applicable:
topic_id, topic_slug, category, source_id, media_id, quiz_id, lesson_id,
anonymous_or_authenticated, referrer, surface, session_id.

## North-star metric
Meaningful Learning Session (MLS):
A session qualifies when a user meaningfully engages with a topic by satisfying a defined
combination of topic view + engagement threshold and/or a learning action such as lesson/quiz completion.
The exact threshold should be validated during MVP rather than assumed permanent.

## Guardrails
Do not collect unnecessary sensitive personal data.
Document retention and deletion rules.
