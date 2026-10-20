from datetime import datetime
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.database import get_db
from app.main import app
from app.models.application import Application
from app.models.event import Event
from app.models.incident import Incident


class FakeQuery:
    def __init__(self, rows):
        self.rows = rows

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def all(self):
        return self.rows

    def first(self):
        return self.rows[0] if self.rows else None


class FakeDatabase:
    def __init__(self, rows=None):
        self.rows = rows or {}

    def query(self, model):
        return FakeQuery(self.rows.get(model, []))

    def add(self, row):
        if isinstance(row, (Event, Incident)) and row.id is None:
            row.id = uuid4()
        if isinstance(row, Event) and row.created_at is None:
            row.created_at = datetime(2026, 1, 1, 12, 0, 0)
        self.rows.setdefault(type(row), []).append(row)

    def commit(self):
        pass

    def refresh(self, _row):
        pass


class ApiRouteTests(TestCase):
    def setUp(self):
        self.database = FakeDatabase()
        app.dependency_overrides[get_db] = lambda: self.database
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.pop(get_db, None)

    def test_events_endpoint_returns_backend_envelope(self):
        event = SimpleNamespace(
            id=uuid4(),
            application_id=uuid4(),
            event_type="login_failed",
            created_at=datetime(2026, 1, 1, 12, 0, 0),
            user_identifier=None,
            ip_address=None,
            user_agent=None,
            device_name=None,
            location=None,
            event_metadata={},
            risk_points=10,
        )
        self.database.rows[Event] = [event]

        response = self.client.get("/v1/events?limit=5")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["total"], 1)
        self.assertEqual(body["events"][0]["event_type"], "login_failed")
        self.assertIsNone(body["events"][0]["ip_address"])

    def test_events_endpoint_returns_valid_empty_envelope(self):
        response = self.client.get("/v1/events")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"events": [], "total": 0})

    def test_ingested_event_can_be_retrieved(self):
        application_id = uuid4()
        self.database.rows[Application] = [SimpleNamespace(id=application_id)]

        created = self.client.post(
            "/v1/events",
            json={
                "application_id": str(application_id),
                "event_type": "login_failed",
                "user_identifier": "analyst-test@example.invalid",
                "event_metadata": {"source": "isolated_api_test"},
            },
        )

        self.assertEqual(created.status_code, 200)
        event_id = created.json()["id"]
        retrieved = self.client.get("/v1/events?limit=50")
        self.assertEqual(retrieved.status_code, 200)
        self.assertEqual(retrieved.json()["events"][0]["id"], event_id)

    def test_agent_analysis_persists_only_detected_incidents(self):
        application_id = uuid4()
        self.database.rows[Event] = [SimpleNamespace(
            id=uuid4(),
            application_id=application_id,
            event_type="login_failed",
            user_identifier=None,
            ip_address=None,
            user_agent=None,
            device_name=None,
            location=None,
            risk_points=10,
            event_metadata={},
            created_at=datetime(2026, 1, 1, 12, 0, 0),
        )]
        threat = {
            "is_threat": True,
            "title": "Detected threat",
            "description": "Analysis test result",
            "attack_type": "Credential Attack",
            "severity": "HIGH",
            "risk_score": 75,
        }

        with patch("app.api.routes.agent.analyze_events", return_value=threat):
            response = self.client.post("/v1/agent/analyze")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["incident_created"])
        self.assertEqual(len(self.database.rows.get(Incident, [])), 1)

        self.database.rows[Incident] = []
        no_threat = {"is_threat": False, "severity": "LOW", "risk_score": 0}
        with patch("app.api.routes.agent.analyze_events", return_value=no_threat):
            response = self.client.post("/v1/agent/analyze")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["incident_created"])
        self.assertEqual(self.database.rows.get(Incident, []), [])

    def test_agent_failure_does_not_persist_an_incident(self):
        self.database.rows[Event] = [SimpleNamespace(
            id=uuid4(),
            application_id=uuid4(),
            event_type="login_failed",
            user_identifier=None,
            ip_address=None,
            user_agent=None,
            device_name=None,
            location=None,
            risk_points=10,
            event_metadata={},
            created_at=datetime(2026, 1, 1, 12, 0, 0),
        )]
        self.client = TestClient(app, raise_server_exceptions=False)

        with patch("app.api.routes.agent.analyze_events", side_effect=RuntimeError("upstream unavailable")):
            response = self.client.post("/v1/agent/analyze")

        self.assertEqual(response.status_code, 500)
        self.assertEqual(self.database.rows.get(Incident, []), [])

    def test_incidents_endpoint_returns_backend_envelope_and_empty_result(self):
        incident = self._incident()
        self.database.rows[Incident] = [incident]

        response = self.client.get("/v1/incidents")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["total"], 1)
        self.assertEqual(response.json()["incidents"][0]["id"], str(incident.id))

        self.database.rows[Incident] = []
        empty_response = self.client.get("/v1/incidents")
        self.assertEqual(empty_response.status_code, 200)
        self.assertEqual(empty_response.json(), {"incidents": [], "total": 0})

    def test_report_endpoint_returns_pdf(self):
        incident = self._incident()
        self.database.rows[Incident] = [incident]

        with patch("app.api.routes.incidents.build_incident_report_pdf", return_value=b"%PDF-1.4 test"):
            response = self.client.post(f"/v1/incidents/{incident.id}/report")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "application/pdf")
        self.assertTrue(response.content.startswith(b"%PDF-1.4"))

    def test_cors_allows_production_and_project_preview_origins(self):
        origins = (
            "https://sentinel-axon.vercel.app",
            "https://sentinel-axon-feature-abc123-drstrange-clouds-projects.vercel.app",
        )

        for origin in origins:
            with self.subTest(origin=origin):
                response = self.client.options(
                    "/v1/events",
                    headers={
                        "Origin": origin,
                        "Access-Control-Request-Method": "GET",
                        "Access-Control-Request-Headers": "accept",
                    },
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["access-control-allow-origin"], origin)

    @staticmethod
    def _incident():
        return SimpleNamespace(
            id=uuid4(),
            application_id=uuid4(),
            title="Test incident",
            description="Backend summary",
            attack_type="Credential Attack",
            severity="HIGH",
            risk_score=75,
            status="open",
            recommendation=None,
            incident_metadata={},
            attack_chain={"events": []},
            evidence={},
            ai_summary="Backend summary",
        )
