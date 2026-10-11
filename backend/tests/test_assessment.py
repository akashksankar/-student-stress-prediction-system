"""
Automated Unit Tests for Student Stress Prediction Engine (MCA Academic Project)
Verifies:
- Answer weight mappings: Yes=2, Sometimes=1, No=0
- Cumulative score boundary: [0, 40]
- Documented threshold boundaries:
  - Low: 0 to 13
  - Moderate: 14 to 26
  - High: 27 to 40
"""

import unittest

def calculate_score_and_category(answers: list):
    if len(answers) != 20:
        raise ValueError("Assessment requires exactly 20 answered questions.")
    
    mapping = {"Yes": 2, "Sometimes": 1, "No": 0}
    total = sum(mapping[a] for a in answers)

    if total <= 13:
        level = "Low"
    elif total <= 26:
        level = "Moderate"
    else:
        level = "High"

    return total, level


class TestStudentStressPredictionEngine(unittest.TestCase):

    def test_twenty_questions_required(self):
        with self.assertRaises(ValueError):
            calculate_score_and_category(["Yes"] * 19)

    def test_score_mapping_all_no(self):
        score, level = calculate_score_and_category(["No"] * 20)
        self.assertEqual(score, 0)
        self.assertEqual(level, "Low")

    def test_score_threshold_low_boundary(self):
        # 6 Yes (12) + 1 Sometimes (1) + 13 No (0) = 13 points -> Low
        answers = ["Yes"] * 6 + ["Sometimes"] * 1 + ["No"] * 13
        score, level = calculate_score_and_category(answers)
        self.assertEqual(score, 13)
        self.assertEqual(level, "Low")

    def test_score_threshold_moderate_lower_boundary(self):
        # 7 Yes (14) + 13 No (0) = 14 points -> Moderate
        answers = ["Yes"] * 7 + ["No"] * 13
        score, level = calculate_score_and_category(answers)
        self.assertEqual(score, 14)
        self.assertEqual(level, "Moderate")

    def test_score_threshold_moderate_upper_boundary(self):
        # 13 Yes (26) + 7 No (0) = 26 points -> Moderate
        answers = ["Yes"] * 13 + ["No"] * 7
        score, level = calculate_score_and_category(answers)
        self.assertEqual(score, 26)
        self.assertEqual(level, "Moderate")

    def test_score_threshold_high_lower_boundary(self):
        # 13 Yes (26) + 1 Sometimes (1) + 6 No (0) = 27 points -> High
        answers = ["Yes"] * 13 + ["Sometimes"] * 1 + ["No"] * 6
        score, level = calculate_score_and_category(answers)
        self.assertEqual(score, 27)
        self.assertEqual(level, "High")

    def test_score_mapping_all_yes_maximum(self):
        score, level = calculate_score_and_category(["Yes"] * 20)
        self.assertEqual(score, 40)
        self.assertEqual(level, "High")


if __name__ == "__main__":
    unittest.main()
