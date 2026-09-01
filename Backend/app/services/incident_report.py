from __future__ import annotations

import json
from datetime import datetime, timezone
from io import BytesIO
from textwrap import wrap
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.incident import Incident


SENSITIVE_KEY_PARTS = ("password", "secret", "token", "api_key", "apikey", "authorization")


def build_incident_report_pdf(db: Session, incident: Incident) -> bytes:
    application_name = _get_application_name(db, incident.application_id)
    events = _get_incident_events(db, incident.id)
    agent_outputs = _get_agent_outputs(db, incident.id)
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    metadata = _redact_mapping(incident.incident_metadata or {})

    lines: list[tuple[str, str]] = []
    _title(lines, "SENTINEL AI INCIDENT REPORT")
    _paragraph(lines, "Generated", generated_at)

    _section(lines, "Incident Header")
    _kv(lines, "Incident ID", str(incident.id))
    _kv(lines, "Severity", incident.severity)
    _kv(lines, "Application", application_name or str(incident.application_id))
    _kv(lines, "Risk Score", str(incident.risk_score))
    _kv(lines, "Status", str(metadata.get("status", "Unknown")))
    _kv(lines, "User", _first_available(metadata, "user", "user_identifier", "user_id") or "Unknown")
    _kv(lines, "Source IP", _first_available(metadata, "source_ip", "ip_address") or "Unknown")
    _kv(lines, "Generated Time", generated_at)

    _section(lines, "Executive Summary")
    _kv(lines, "Threat Type", _first_available(metadata, "threat_type", "classification", "event_type") or incident.title)
    _paragraph(lines, "Attack Sequence", _stringify(incident.attack_chain or metadata.get("attack_sequence", "Not available")))
    _paragraph(lines, "Description", incident.description or "No incident description available.")

    _section(lines, "Correlated Security Telemetry")
    if events:
        for event in events:
            _kv(lines, "Event", f"{event.get('created_at', 'Unknown')} | {event.get('event_type', 'Unknown')}")
            _kv(lines, "Source IP", str(event.get("ip_address") or "Unknown"))
            _paragraph(lines, "Metadata", _stringify(_redact_mapping(event.get("metadata") or {})))
            _spacer(lines)
    else:
        _paragraph(lines, "Events", "No incident_events relationship data available for this incident.")

    _section(lines, "Risk Breakdown")
    risk_factors = metadata.get("risk_factors")
    if risk_factors:
        _paragraph(lines, "Risk Factors", _stringify(risk_factors))
    else:
        _kv(lines, "Incident Risk Score", str(incident.risk_score))
        _paragraph(lines, "Risk Factors", "No detailed backend risk factor breakdown available.")

    _section(lines, "Multi-Agent AI Findings")
    if agent_outputs:
        grouped = _group_agent_outputs(agent_outputs)
        for agent_name, outputs in grouped.items():
            _kv(lines, "Agent", agent_name)
            for output in outputs:
                _paragraph(lines, "Finding", _stringify(_redact_mapping(output)))
    else:
        _paragraph(lines, "Agent Outputs", "No agent_outputs data available for this incident.")

    _section(lines, "Response Recommendations")
    if incident.recommendation:
        _paragraph(lines, "Recommendation", incident.recommendation)
    else:
        recommendation = _first_agent_recommendation(agent_outputs)
        _paragraph(lines, "Recommendation", recommendation or "No response recommendation available.")

    return _render_pdf(lines)


def _get_application_name(db: Session, application_id: UUID) -> str | None:
    result = db.execute(
        text("SELECT name FROM applications WHERE id = :application_id"),
        {"application_id": str(application_id)},
    ).mappings().first()
    return str(result["name"]) if result and result.get("name") else None


def _get_incident_events(db: Session, incident_id: UUID) -> list[dict[str, Any]]:
    if not _table_exists(db, "incident_events"):
        return []

    result = db.execute(
        text(
            """
            SELECT e.id, e.created_at, e.event_type, e.ip_address, e.metadata, e.risk_points
            FROM incident_events ie
            JOIN events e ON e.id = ie.event_id
            WHERE ie.incident_id = :incident_id
            ORDER BY e.created_at ASC
            """
        ),
        {"incident_id": str(incident_id)},
    )
    return [dict(row) for row in result.mappings().all()]


def _get_agent_outputs(db: Session, incident_id: UUID) -> list[dict[str, Any]]:
    if not _table_exists(db, "agent_outputs"):
        return []

    columns = {row["column_name"] for row in db.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'agent_outputs'
            """
        )
    ).mappings()}

    if "incident_id" not in columns:
        return []

    result = db.execute(
        text("SELECT * FROM agent_outputs WHERE incident_id = :incident_id"),
        {"incident_id": str(incident_id)},
    )
    return [_redact_mapping(dict(row)) for row in result.mappings().all()]


def _table_exists(db: Session, table_name: str) -> bool:
    result = db.execute(
        text(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = :table_name
            )
            """
        ),
        {"table_name": table_name},
    ).scalar()
    return bool(result)


def _group_agent_outputs(agent_outputs: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for output in agent_outputs:
        agent_name = str(
            output.get("agent")
            or output.get("agent_name")
            or output.get("agent_type")
            or "Unknown Agent"
        )
        grouped.setdefault(agent_name, []).append(output)
    return grouped


def _first_agent_recommendation(agent_outputs: list[dict[str, Any]]) -> str | None:
    for output in agent_outputs:
        for key in ("recommendation", "recommendations", "response_recommendation"):
            if output.get(key):
                return _stringify(output[key])
    return None


def _redact_mapping(value: dict[str, Any]) -> dict[str, Any]:
    redacted: dict[str, Any] = {}
    for key, item in value.items():
        if any(part in key.lower() for part in SENSITIVE_KEY_PARTS):
            redacted[key] = "[REDACTED]"
        elif isinstance(item, dict):
            redacted[key] = _redact_mapping(item)
        elif isinstance(item, list):
            redacted[key] = [
                _redact_mapping(entry) if isinstance(entry, dict) else entry
                for entry in item
            ]
        else:
            redacted[key] = item
    return redacted


def _first_available(values: dict[str, Any], *keys: str) -> str | None:
    for key in keys:
        value = values.get(key)
        if value is not None and str(value).strip():
            return str(value)
    return None


def _section(lines: list[tuple[str, str]], title: str) -> None:
    lines.append(("section", title))


def _title(lines: list[tuple[str, str]], title: str) -> None:
    lines.append(("title", title))


def _kv(lines: list[tuple[str, str]], key: str, value: str) -> None:
    lines.append(("body", f"{key}: {value}"))


def _paragraph(lines: list[tuple[str, str]], key: str, value: str) -> None:
    lines.append(("body", f"{key}:"))
    for line in _stringify(value).splitlines() or [""]:
        lines.append(("mono", f"  {line}"))


def _spacer(lines: list[tuple[str, str]]) -> None:
    lines.append(("space", ""))


def _stringify(value: Any) -> str:
    if value is None:
        return "Not available"
    if isinstance(value, (str, int, float, bool)):
        return str(value)
    return json.dumps(value, indent=2, default=str, ensure_ascii=True)


def _render_pdf(lines: list[tuple[str, str]]) -> bytes:
    pages: list[list[str]] = [[]]
    current_y = 742

    def add_page() -> None:
        nonlocal current_y
        pages.append([])
        current_y = 742

    for kind, text_value in lines:
        if kind == "space":
            current_y -= 8
            continue

        if kind == "title":
            if current_y < 710:
                add_page()
            pages[-1].append(
                f"BT /F1 18 Tf 44 {current_y} Td ({_escape_pdf_text(text_value)}) Tj ET"
            )
            current_y -= 28
            continue

        if kind == "section":
            if current_y < 112:
                add_page()
            current_y -= 10
            pages[-1].append(
                f"BT /F1 13 Tf 44 {current_y} Td ({_escape_pdf_text(text_value.upper())}) Tj ET"
            )
            current_y -= 18
            continue

        font = "F2" if kind == "mono" else "F1"
        font_size = 8 if kind == "mono" else 10
        line_height = 11 if kind == "mono" else 14
        max_width = 86 if kind == "mono" else 92
        wrapped = wrap(text_value, width=max_width, replace_whitespace=False) or [""]
        for text_line in wrapped:
            if current_y < 72:
                add_page()
            pages[-1].append(
                f"BT /{font} {font_size} Tf 50 {current_y} Td ({_escape_pdf_text(text_line)}) Tj ET"
            )

            current_y -= line_height

    return _write_pdf(pages)


def _write_pdf(pages: list[list[str]]) -> bytes:
    objects: list[bytes] = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        f"<< /Type /Pages /Kids [{' '.join(f'{3 + i * 2} 0 R' for i in range(len(pages)))}] /Count {len(pages)} >>".encode(),
    ]

    for index, page in enumerate(pages):
        page_obj_id = 3 + index * 2
        content_obj_id = page_obj_id + 1
        stream = "\n".join(page).encode("latin-1", errors="replace")
        objects.append(
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> /Contents {content_obj_id} 0 R >>".encode()
        )
        objects.append(
            b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream"
        )

    output = BytesIO()
    output.write(b"%PDF-1.4\n")
    offsets = [0]
    for obj_id, obj in enumerate(objects, start=1):
        offsets.append(output.tell())
        output.write(f"{obj_id} 0 obj\n".encode())
        output.write(obj)
        output.write(b"\nendobj\n")

    xref_offset = output.tell()
    output.write(f"xref\n0 {len(objects) + 1}\n".encode())
    output.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.write(f"{offset:010d} 00000 n \n".encode())
    output.write(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode()
    )
    return output.getvalue()


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
