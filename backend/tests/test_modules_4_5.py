import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.config import Config
from app.services.gemini_service import (
    generate_medical_explanations,
    answer_document_question,
    GeminiConfigurationError,
    GeminiExtractionError
)

class TestModules4And5(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.client = cls.app.test_client()

    # --- Module 4: Medical Explanations ---

    def test_explain_missing_key_raises_configuration_error(self):
        """Verify 503 error is raised when GEMINI_API_KEY is missing."""
        with patch.object(Config, 'GEMINI_API_KEY', ''):
            with self.assertRaises(GeminiConfigurationError):
                generate_medical_explanations("Sample report text", custom_api_key='')

    def test_explain_empty_text_raises_error(self):
        """Verify 400 error is raised when text is empty."""
        with self.assertRaises(GeminiExtractionError):
            generate_medical_explanations("", custom_api_key='mock_key')

    @patch('app.services.gemini_service.genai.Client')
    def test_generate_medical_explanations_mock(self, mock_client_cls):
        """Verify plain-English explanation parsing with distinct document observation."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        simulated_response = {
            "general_summary": "Your Complete Blood Count report is within normal ranges.",
            "test_explanations": [
                {
                    "test_name": "Hemoglobin",
                    "observed_value": "14.5 g/dL",
                    "reference_range": "13.5 - 17.5 g/dL",
                    "status_summary": "Within Normal Range",
                    "document_observation": "The report shows Hemoglobin at 14.5 g/dL, within the normal range of 13.5 - 17.5 g/dL.",
                    "plain_english_explanation": "Hemoglobin is an oxygen-carrying protein found in red blood cells."
                }
            ],
            "medication_explanations": [],
            "questions_for_doctor": ["When should I have my next routine blood panel?"],
            "disclaimer": "Educational information only."
        }

        mock_resp = MagicMock()
        mock_resp.text = json.dumps(simulated_response)
        mock_client.models.generate_content.return_value = mock_resp

        result = generate_medical_explanations(
            "Hemoglobin: 14.5 g/dL (Reference: 13.5 - 17.5)",
            custom_api_key="mock_key"
        )

        self.assertIn("general_summary", result)
        self.assertEqual(len(result['test_explanations']), 1)
        test_exp = result['test_explanations'][0]
        self.assertEqual(test_exp['test_name'], 'Hemoglobin')
        self.assertEqual(test_exp['status_summary'], 'Within Normal Range')
        self.assertIn("within the normal range", test_exp['document_observation'])
        self.assertIn("oxygen-carrying protein", test_exp['plain_english_explanation'])
        self.assertEqual(len(result['questions_for_doctor']), 1)

    def test_explain_endpoint_missing_text(self):
        """Verify POST /api/explain-medical-report rejects empty payload with 400."""
        res = self.client.post('/api/explain-medical-report', json={})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn('No medical document text provided', data['error'])

    def test_explain_endpoint_missing_key(self):
        """Verify POST /api/explain-medical-report returns 503 when API key is missing."""
        with patch.object(Config, 'GEMINI_API_KEY', ''):
            res = self.client.post('/api/explain-medical-report', json={'text': 'Hemoglobin 14.5 g/dL'})
            self.assertEqual(res.status_code, 503)
            data = res.get_json()
            self.assertTrue(data.get('missing_key'))

    # --- Module 5: Ask Your Report ---

    def test_ask_missing_key_raises_configuration_error(self):
        """Verify 503 error is raised when GEMINI_API_KEY is missing."""
        with patch.object(Config, 'GEMINI_API_KEY', ''):
            with self.assertRaises(GeminiConfigurationError):
                answer_document_question("What is my result?", "Document text", custom_api_key='')

    def test_ask_empty_question_raises_error(self):
        """Verify 400 error is raised when question is empty."""
        with self.assertRaises(GeminiExtractionError):
            answer_document_question("", "Some document text", custom_api_key='mock_key')

    @patch('app.services.gemini_service.genai.Client')
    def test_ask_document_question_mock_success(self, mock_client_cls):
        """Verify grounded answer with quoted evidence from report."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        simulated_response = {
            "answer": "Your hemoglobin level is 14.5 g/dL, which is within the stated normal laboratory reference range of 13.5 - 17.5 g/dL.",
            "grounded_in_document": True,
            "quoted_evidence": "Hemoglobin: 14.5 g/dL (Reference: 13.5 - 17.5 g/dL) [NORMAL]",
            "disclaimer": "Educational response based on uploaded document."
        }

        mock_resp = MagicMock()
        mock_resp.text = json.dumps(simulated_response)
        mock_client.models.generate_content.return_value = mock_resp

        result = answer_document_question(
            "What is my hemoglobin level?",
            "Hemoglobin: 14.5 g/dL (Reference: 13.5 - 17.5 g/dL) [NORMAL]",
            custom_api_key="mock_key"
        )

        self.assertTrue(result['grounded_in_document'])
        self.assertIn("14.5 g/dL", result['answer'])
        self.assertIn("14.5 g/dL", result['quoted_evidence'])

    @patch('app.services.gemini_service.genai.Client')
    def test_ask_document_question_mock_not_found(self, mock_client_cls):
        """Verify graceful statement when requested fact is not in report."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        simulated_response = {
            "answer": "This information is not mentioned in your uploaded report. The document only contains Complete Blood Count results and does not mention blood glucose or diabetes tests.",
            "grounded_in_document": False,
            "quoted_evidence": None,
            "disclaimer": "Educational response."
        }

        mock_resp = MagicMock()
        mock_resp.text = json.dumps(simulated_response)
        mock_client.models.generate_content.return_value = mock_resp

        result = answer_document_question(
            "What is my fasting blood sugar?",
            "Hemoglobin: 14.5 g/dL (Reference: 13.5 - 17.5 g/dL)",
            custom_api_key="mock_key"
        )

        self.assertFalse(result['grounded_in_document'])
        self.assertIn("not mentioned in your uploaded report", result['answer'])

    def test_ask_endpoint_empty_payload(self):
        """Verify POST /api/ask-document rejects empty payload with 400."""
        res = self.client.post('/api/ask-document', json={})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn('Please enter a question', data['error'])

    def test_ask_endpoint_missing_text(self):
        """Verify POST /api/ask-document rejects missing document text with 400."""
        res = self.client.post('/api/ask-document', json={'question': 'Is my test normal?'})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn('No document text found', data['error'])


if __name__ == '__main__':
    unittest.main()
