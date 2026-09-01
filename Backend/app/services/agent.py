import os
import json

from groq import Groq


client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


SYSTEM_PROMPT = """
You are Sentinel, a cybersecurity incident analysis agent.

You analyze authentication and security events from a web application.

Your job is to:
1. Identify suspicious behavior.
2. Determine severity.
3. Calculate a risk score from 0 to 100.
4. Explain the threat.
5. Recommend an action.

Return ONLY valid JSON in this exact format:

{
  "is_threat": true,
  "title": "Suspicious Login Activity",
  "description": "Multiple failed login attempts detected.",
  "severity": "HIGH",
  "risk_score": 85,
  "recommendation": "Temporarily block the source IP and require MFA.",
  "attack_type": "Credential Attack"
}

Severity must be one of:
LOW, MEDIUM, HIGH, CRITICAL.

Do not include markdown.
Do not include ```json.
"""


def analyze_events(events: list[dict]) -> dict:

    events_text = json.dumps(
        events,
        indent=2,
        default=str
    )

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": (
                    "Analyze these security events:\n\n"
                    + events_text
                )
            }
        ],
        temperature=0.2,
        max_completion_tokens=1000
    )

    content = response.choices[0].message.content

    return json.loads(content)